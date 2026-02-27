/**
 * Cron Scheduler for Automatic Rate Sync
 * 
 * Runs the rate sync service on a configurable schedule.
 * 
 * Environment Variables:
 *   SYNC_CRON      — Cron expression (default: every 6 hours)
 *   SYNC_ON_BOOT   — "true" to run sync immediately on server start
 *   SYNC_ENABLED   — "false" to disable scheduler entirely
 */

const cron = require("node-cron");
const rateSyncService = require("./rateSyncService");

const SYNC_CRON = process.env.SYNC_CRON || "0 */6 * * *"; // Every 6 hours
const SYNC_ON_BOOT = process.env.SYNC_ON_BOOT === "true";
const SYNC_ENABLED = process.env.SYNC_ENABLED !== "false"; // Enabled by default

let scheduledTask = null;

/**
 * Start the sync scheduler
 */
function start() {
    if (!SYNC_ENABLED) {
        console.log("[Scheduler] Rate sync is disabled (SYNC_ENABLED=false)");
        return;
    }

    if (!cron.validate(SYNC_CRON)) {
        console.error(`[Scheduler] Invalid cron expression: ${SYNC_CRON}`);
        return;
    }

    console.log(`[Scheduler] Rate sync scheduled: ${SYNC_CRON}`);
    console.log(`[Scheduler] Sync on boot: ${SYNC_ON_BOOT}`);

    // Schedule recurring sync
    scheduledTask = cron.schedule(SYNC_CRON, async () => {
        console.log(`[Scheduler] Scheduled sync triggered at ${new Date().toISOString()}`);
        try {
            const result = await rateSyncService.runSync("scheduler");
            console.log("[Scheduler] Sync result:", JSON.stringify({
                totalUpdated: result.totalUpdated,
                totalAdded: result.totalAdded,
                totalErrors: result.totalErrors,
            }));
        } catch (err) {
            console.error("[Scheduler] Sync failed:", err.message);
        }
    });

    // Run on boot if configured
    if (SYNC_ON_BOOT) {
        console.log("[Scheduler] Running initial sync on boot...");
        setTimeout(async () => {
            try {
                await rateSyncService.runSync("boot");
            } catch (err) {
                console.error("[Scheduler] Boot sync failed:", err.message);
            }
        }, 5000); // Delay 5s to let DB fully initialize
    }
}

/**
 * Stop the scheduler
 */
function stop() {
    if (scheduledTask) {
        scheduledTask.stop();
        scheduledTask = null;
        console.log("[Scheduler] Rate sync scheduler stopped");
    }
}

/**
 * Get scheduler status
 */
function getStatus() {
    return {
        enabled: SYNC_ENABLED,
        cronExpression: SYNC_CRON,
        syncOnBoot: SYNC_ON_BOOT,
        running: scheduledTask !== null,
    };
}

module.exports = { start, stop, getStatus };
