/**
 * CBIC GST Rate Notification Scraper
 * 
 * Scrapes the official CBIC website for the latest GST rate schedules.
 * The CBIC publishes rate notifications as HTML tables on:
 *   https://cbic-gst.gov.in/gst-goods-services-rates.html
 * 
 * This scraper parses those tables to extract HSN codes and current rates.
 */

const cheerio = require("cheerio");

const CBIC_RATES_URL = "https://cbic-gst.gov.in/gst-goods-services-rates.html";
const CBIC_BASE_URL = "https://cbic-gst.gov.in";

// Known CBIC rate schedule page patterns
const SCHEDULE_URLS = [
    "https://cbic-gst.gov.in/gst-goods-services-rates.html",
    "https://cbic-gst.gov.in/pdf/gst-rate-schedule-for-goods-dt-01-01-2025.pdf",
];

/**
 * Fetch and parse GST rates from CBIC website
 * @returns {Promise<{rates: Array, notifications: Array, error: string|null}>}
 */
async function scrapeRates() {
    const result = { rates: [], notifications: [], error: null };

    try {
        // Fetch the main rates page
        const response = await fetch(CBIC_RATES_URL, {
            headers: {
                "User-Agent": "GSTGuru-SyncBot/1.0 (Educational Project)",
                "Accept": "text/html,application/xhtml+xml",
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            result.error = `CBIC fetch failed: HTTP ${response.status}`;
            return result;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Parse rate schedule tables
        // CBIC pages typically have tables with columns: S.No, Chapter/HSN, Description, Rate
        $("table").each((_, table) => {
            const headers = [];
            $(table).find("thead tr th, tr:first-child th, tr:first-child td").each((_, th) => {
                headers.push($(th).text().trim().toLowerCase());
            });

            // Check if this looks like a rate table
            const hasHSN = headers.some(h => h.includes("hsn") || h.includes("chapter") || h.includes("heading"));
            const hasRate = headers.some(h => h.includes("rate") || h.includes("gst") || h.includes("%"));

            if (!hasHSN && !hasRate) return;

            // Find column indices
            const hsnIdx = headers.findIndex(h => h.includes("hsn") || h.includes("chapter") || h.includes("heading"));
            const descIdx = headers.findIndex(h => h.includes("description") || h.includes("goods") || h.includes("service"));
            const rateIdx = headers.findIndex(h => h.includes("rate") || h.includes("gst") || h.includes("%"));

            $(table).find("tbody tr, tr").slice(1).each((_, tr) => {
                const cells = [];
                $(tr).find("td").each((_, td) => {
                    cells.push($(td).text().trim());
                });

                if (cells.length < 2) return;

                const hsnRaw = cells[hsnIdx >= 0 ? hsnIdx : 0] || "";
                const description = cells[descIdx >= 0 ? descIdx : 1] || "";
                const rateRaw = cells[rateIdx >= 0 ? rateIdx : cells.length - 1] || "";

                // Extract HSN code (4-8 digit number)
                const hsnMatch = hsnRaw.match(/(\d{4,8})/);
                if (!hsnMatch) return;

                // Extract rate (number possibly with %)
                const rateMatch = rateRaw.match(/([\d.]+)\s*%?/);
                if (!rateMatch) return;

                const rate = parseFloat(rateMatch[1]);
                if (isNaN(rate) || rate > 100) return; // Sanity check

                result.rates.push({
                    hsn_sac_code: hsnMatch[1],
                    description: description.substring(0, 200),
                    rate_percent: rate,
                    source: "cbic",
                });
            });
        });

        // Also look for notification links (PDFs, circulars)
        $("a[href*='notification'], a[href*='circular'], a[href*='rate']").each((_, link) => {
            const href = $(link).attr("href");
            const text = $(link).text().trim();
            if (text && href) {
                result.notifications.push({
                    title: text.substring(0, 200),
                    url: href.startsWith("http") ? href : `${CBIC_BASE_URL}/${href}`,
                });
            }
        });

        console.log(`[CBIC Scraper] Found ${result.rates.length} rates, ${result.notifications.length} notification links`);
    } catch (err) {
        result.error = `CBIC scraper error: ${err.message}`;
        console.error("[CBIC Scraper]", err.message);
    }

    return result;
}

module.exports = { scrapeRates };
