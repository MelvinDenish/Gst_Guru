/**
 * Rate Sync Service
 * 
 * Orchestrates fetching rates from multiple sources, comparing
 * them with the database, and applying updates automatically.
 * Logs every run to the SyncLog table and notifies subscribed users.
 */

const { Op } = require("sequelize");
const { GstRate, Category, Notification, RateAlert, SyncLog } = require("../models");
const cbicScraper = require("./cbicScraper");
const gstApiClient = require("./gstApiClient");

let syncInProgress = false;

/**
 * Run a full sync cycle across all configured sources
 * @param {string} triggeredBy — "scheduler" | "manual"
 * @returns {Promise<object>} — summary of the sync run
 */
async function runSync(triggeredBy = "scheduler") {
    if (syncInProgress) {
        console.log("[Rate Sync] Sync already in progress, skipping");
        return { skipped: true, reason: "Sync already in progress" };
    }

    syncInProgress = true;
    const summary = { sources: [], totalUpdated: 0, totalAdded: 0, totalErrors: 0 };

    try {
        console.log(`[Rate Sync] Starting sync cycle (triggered by: ${triggeredBy})`);

        // ── Source 1: CBIC Scraper ─────────────────────────────
        try {
            const cbicResult = await syncFromSource("cbic", async () => {
                const { rates, error } = await cbicScraper.scrapeRates();
                return { rates, error };
            });
            summary.sources.push(cbicResult);
        } catch (err) {
            summary.sources.push({ source: "cbic", error: err.message });
        }

        // ── Source 2: Third-Party API ──────────────────────────
        if (gstApiClient.isConfigured()) {
            try {
                const apiResult = await syncFromSource("api", async () => {
                    const { rates, error } = await gstApiClient.fetchRates();
                    return { rates, error };
                });
                summary.sources.push(apiResult);
            } catch (err) {
                summary.sources.push({ source: "api", error: err.message });
            }
        } else {
            summary.sources.push({ source: "api", skipped: true, reason: "No API key configured" });
        }

        // ── Source 3: data.gov.in ──────────────────────────────
        try {
            const dataGovResult = await syncFromSource("datagov", async () => {
                return await fetchFromDataGov();
            });
            summary.sources.push(dataGovResult);
        } catch (err) {
            summary.sources.push({ source: "datagov", error: err.message });
        }

        // Aggregate totals
        for (const src of summary.sources) {
            summary.totalUpdated += src.updated || 0;
            summary.totalAdded += src.added || 0;
            summary.totalErrors += src.errors || 0;
        }

        console.log(`[Rate Sync] Cycle complete: ${summary.totalUpdated} updated, ${summary.totalAdded} added, ${summary.totalErrors} errors`);
    } finally {
        syncInProgress = false;
    }

    return summary;
}

/**
 * Sync from a single source — fetch, compare, update, log
 */
async function syncFromSource(sourceName, fetchFn) {
    const log = await SyncLog.create({
        source: sourceName,
        status: "running",
        started_at: new Date(),
    });

    const result = { source: sourceName, checked: 0, updated: 0, added: 0, errors: 0, details: [] };

    try {
        const { rates, error } = await fetchFn();

        if (error) {
            result.details.push({ type: "fetch_error", message: error });
            if (!rates || rates.length === 0) {
                log.status = "failed";
                log.details_json = JSON.stringify(result);
                log.completed_at = new Date();
                await log.save();
                return result;
            }
        }

        result.checked = rates.length;

        // Compare each fetched rate with the database
        for (const fetchedRate of rates) {
            try {
                await compareAndUpdate(fetchedRate, sourceName, result);
            } catch (err) {
                result.errors++;
                result.details.push({
                    type: "update_error",
                    hsn: fetchedRate.hsn_sac_code,
                    message: err.message,
                });
            }
        }

        log.status = result.errors > 0 ? "partial" : "success";
        log.rates_checked = result.checked;
        log.rates_updated = result.updated;
        log.rates_added = result.added;
        log.errors = result.errors;
        log.details_json = JSON.stringify(result.details.slice(0, 50)); // Limit stored details
        log.completed_at = new Date();
        await log.save();
    } catch (err) {
        log.status = "failed";
        log.details_json = JSON.stringify({ error: err.message });
        log.completed_at = new Date();
        await log.save();
        result.errors++;
    }

    return result;
}

/**
 * Compare a fetched rate with the DB and update if different
 */
async function compareAndUpdate(fetchedRate, source, result) {
    const { hsn_sac_code, description, rate_percent, cess_percent = 0 } = fetchedRate;
    const today = new Date().toISOString().split("T")[0];

    // Find current active rate for this HSN
    const existing = await GstRate.findOne({
        where: {
            hsn_sac_code,
            effective_from: { [Op.lte]: today },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: today } },
            ],
        },
        order: [["effective_from", "DESC"]],
    });

    if (!existing) {
        // New HSN code — try to find a matching category
        let category_id = null;
        const hsnNum = parseInt(hsn_sac_code);
        if (!isNaN(hsnNum)) {
            const categories = await Category.findAll();
            for (const cat of categories) {
                if (cat.hsn_sac_range) {
                    const [start, end] = cat.hsn_sac_range.split("-").map(Number);
                    if (hsnNum >= start && hsnNum <= end) {
                        category_id = cat.id;
                        break;
                    }
                }
            }
        }

        await GstRate.create({
            hsn_sac_code,
            description: description || `Auto-synced from ${source}`,
            rate_percent,
            cess_percent: cess_percent || 0,
            effective_from: today,
            category_id,
            created_by: null,
        });

        result.added++;
        result.details.push({
            type: "added",
            hsn: hsn_sac_code,
            rate: rate_percent,
            source,
        });
        return;
    }

    // Check if rate has changed
    const oldRate = parseFloat(existing.rate_percent);
    const newRate = parseFloat(rate_percent);

    if (oldRate !== newRate) {
        // Expire the old rate
        existing.effective_to = today;
        await existing.save();

        // Create new rate entry with updated rate
        await GstRate.create({
            hsn_sac_code,
            description: existing.description,
            rate_percent: newRate,
            cess_percent: cess_percent || existing.cess_percent || 0,
            effective_from: today,
            category_id: existing.category_id,
            created_by: null,
        });

        result.updated++;
        result.details.push({
            type: "updated",
            hsn: hsn_sac_code,
            oldRate,
            newRate,
            source,
        });

        // Notify subscribers
        await notifyRateChange(hsn_sac_code, existing.description, oldRate, newRate, source);
    }
    // If rates match, no action needed
}

/**
 * Notify all users subscribed to a specific HSN code about a rate change
 */
async function notifyRateChange(hsn_sac_code, description, oldRate, newRate, source) {
    try {
        const alerts = await RateAlert.findAll({ where: { hsn_sac_code } });

        for (const alert of alerts) {
            await Notification.create({
                user_id: alert.user_id,
                type: "rate_change",
                message: `🔄 Auto-Updated: GST rate for ${description} (${hsn_sac_code}) changed from ${oldRate}% to ${newRate}% (source: ${source}).`,
            });
        }

        if (alerts.length > 0) {
            console.log(`[Rate Sync] Notified ${alerts.length} subscribers about ${hsn_sac_code} rate change`);
        }
    } catch (err) {
        console.error("[Rate Sync] Notification error:", err.message);
    }
}

/**
 * Fetch from data.gov.in Open Data Platform
 * Uses publicly available GST datasets
 */
async function fetchFromDataGov() {
    const result = { rates: [], error: null };

    try {
        // data.gov.in GST dataset API (public, no key required for some datasets)
        const DATAGOV_API = "https://data.gov.in/resource/gst-rates-schedule";

        const response = await fetch(DATAGOV_API, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            result.error = `data.gov.in returned HTTP ${response.status}`;
            return result;
        }

        const data = await response.json();
        const records = data.records || data.data || [];

        for (const record of records) {
            const hsn = record.hsn_code || record.HSN || record.hsn_sac_code || "";
            const desc = record.description || record.Description || "";
            const rate = parseFloat(record.rate || record.Rate || record.gst_rate || 0);

            if (hsn && !isNaN(rate)) {
                result.rates.push({
                    hsn_sac_code: String(hsn),
                    description: desc.substring(0, 200),
                    rate_percent: rate,
                    source: "datagov",
                });
            }
        }

        console.log(`[data.gov.in] Fetched ${result.rates.length} rates`);
    } catch (err) {
        result.error = `data.gov.in error: ${err.message}`;
        console.log("[data.gov.in] Fetch failed:", err.message);
    }

    return result;
}

/**
 * Get the last sync status for the admin dashboard
 */
async function getLastSyncStatus() {
    const lastSync = await SyncLog.findOne({
        order: [["started_at", "DESC"]],
    });

    const last24h = await SyncLog.findAll({
        where: {
            started_at: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        order: [["started_at", "DESC"]],
    });

    return {
        lastSync: lastSync || null,
        recentSyncs: last24h,
        isSyncing: syncInProgress,
    };
}

/**
 * Get paginated sync logs
 */
async function getSyncLogs(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await SyncLog.findAndCountAll({
        order: [["started_at", "DESC"]],
        offset,
        limit,
    });

    return {
        logs: rows,
        pagination: {
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
        },
    };
}

module.exports = { runSync, getLastSyncStatus, getSyncLogs };
