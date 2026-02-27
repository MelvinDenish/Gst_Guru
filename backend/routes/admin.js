const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { Op } = require("sequelize");
const { GstRate, Category, Notification, RateAlert, User } = require("../models");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// All admin routes require admin role
router.use(authenticate, requireRole("admin"));

// ══════════════════════════════════════════════════════════
//  Rate Management
// ══════════════════════════════════════════════════════════

// ── List all rates (paginated) ────────────────────────────
router.get("/rates", async (req, res) => {
    try {
        const { page = 1, limit = 50, hsn, active } = req.query;
        const where = {};
        const today = new Date().toISOString().split("T")[0];

        if (hsn) {
            where.hsn_sac_code = { [Op.like]: `${hsn}%` };
        }

        if (active === "true") {
            where.effective_from = { [Op.lte]: today };
            where[Op.or] = [
                { effective_to: null },
                { effective_to: { [Op.gte]: today } },
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await GstRate.findAndCountAll({
            where,
            include: [{ model: Category, attributes: ["id", "name"] }],
            offset,
            limit: parseInt(limit),
            order: [["hsn_sac_code", "ASC"]],
        });

        res.json({
            rates: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch rates" });
    }
});

// ── Create new rate ───────────────────────────────────────
router.post("/rates", async (req, res) => {
    try {
        const {
            hsn_sac_code,
            description,
            rate_percent,
            cess_percent = 0,
            effective_from,
            effective_to,
            category_id,
            applicability_json,
        } = req.body;

        if (!hsn_sac_code || !description || rate_percent === undefined || !effective_from) {
            return res.status(400).json({
                error: "hsn_sac_code, description, rate_percent, and effective_from are required",
            });
        }

        const rate = await GstRate.create({
            hsn_sac_code,
            description,
            rate_percent,
            cess_percent,
            effective_from,
            effective_to: effective_to || null,
            category_id: category_id || null,
            applicability_json: applicability_json || null,
            created_by: req.user.id,
        });

        // Notify subscribed users
        await notifySubscribers(hsn_sac_code, rate_percent, description);

        res.status(201).json({ rate });
    } catch (err) {
        console.error("Rate create error:", err);
        res.status(500).json({ error: "Failed to create rate" });
    }
});

// ── Update rate ───────────────────────────────────────────
router.put("/rates/:id", async (req, res) => {
    try {
        const rate = await GstRate.findByPk(req.params.id);
        if (!rate) {
            return res.status(404).json({ error: "Rate not found" });
        }

        const oldRate = parseFloat(rate.rate_percent);
        const fields = [
            "hsn_sac_code", "description", "rate_percent", "cess_percent",
            "effective_from", "effective_to", "category_id", "applicability_json",
        ];

        fields.forEach((f) => {
            if (req.body[f] !== undefined) rate[f] = req.body[f];
        });

        await rate.save();

        // If rate changed, notify subscribers
        if (parseFloat(rate.rate_percent) !== oldRate) {
            await notifySubscribers(
                rate.hsn_sac_code,
                rate.rate_percent,
                rate.description,
                oldRate
            );
        }

        res.json({ rate });
    } catch (err) {
        res.status(500).json({ error: "Failed to update rate" });
    }
});

// ── Delete rate (soft — set effective_to) ─────────────────
router.delete("/rates/:id", async (req, res) => {
    try {
        const rate = await GstRate.findByPk(req.params.id);
        if (!rate) {
            return res.status(404).json({ error: "Rate not found" });
        }

        rate.effective_to = new Date().toISOString().split("T")[0];
        await rate.save();

        res.json({ message: "Rate deactivated", rate });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete rate" });
    }
});

// ── Bulk upload via CSV ───────────────────────────────────
router.post("/rates/bulk-upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "CSV file is required" });
        }

        const results = [];
        const errors = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on("data", (row) => results.push(row))
                .on("end", resolve)
                .on("error", reject);
        });

        let created = 0;
        for (const row of results) {
            try {
                // Find or create category
                let category_id = null;
                if (row.category) {
                    const [cat] = await Category.findOrCreate({
                        where: { name: row.category },
                        defaults: { name: row.category },
                    });
                    category_id = cat.id;
                }

                await GstRate.create({
                    hsn_sac_code: row.hsn_sac_code || row.hsn,
                    description: row.description,
                    rate_percent: parseFloat(row.rate_percent || row.rate),
                    cess_percent: parseFloat(row.cess_percent || row.cess || 0),
                    effective_from: row.effective_from || new Date().toISOString().split("T")[0],
                    effective_to: row.effective_to || null,
                    category_id,
                    created_by: req.user.id,
                });
                created++;
            } catch (rowErr) {
                errors.push({ row, error: rowErr.message });
            }
        }

        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            message: `Uploaded ${created} rates successfully`,
            created,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        console.error("Bulk upload error:", err);
        res.status(500).json({ error: "Bulk upload failed" });
    }
});

// ══════════════════════════════════════════════════════════
//  Category Management
// ══════════════════════════════════════════════════════════

router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{ model: Category, as: "children" }],
            order: [["name", "ASC"]],
        });
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

router.post("/categories", async (req, res) => {
    try {
        const { name, parent_id, hsn_sac_range } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Category name is required" });
        }

        const category = await Category.create({
            name,
            parent_id: parent_id || null,
            hsn_sac_range: hsn_sac_range || null,
        });

        res.status(201).json({ category });
    } catch (err) {
        res.status(500).json({ error: "Failed to create category" });
    }
});

router.put("/categories/:id", async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        const { name, parent_id, hsn_sac_range } = req.body;
        if (name) category.name = name;
        if (parent_id !== undefined) category.parent_id = parent_id;
        if (hsn_sac_range !== undefined) category.hsn_sac_range = hsn_sac_range;

        await category.save();
        res.json({ category });
    } catch (err) {
        res.status(500).json({ error: "Failed to update category" });
    }
});

router.delete("/categories/:id", async (req, res) => {
    try {
        const deleted = await Category.destroy({ where: { id: req.params.id } });
        if (!deleted) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

// ══════════════════════════════════════════════════════════
//  Helper: Notify alert subscribers
// ══════════════════════════════════════════════════════════
async function notifySubscribers(hsn_sac_code, newRate, description, oldRate) {
    try {
        const alerts = await RateAlert.findAll({ where: { hsn_sac_code } });

        for (const alert of alerts) {
            const message = oldRate !== undefined
                ? `GST rate for ${description} (${hsn_sac_code}) changed from ${oldRate}% to ${newRate}%.`
                : `New GST rate set for ${description} (${hsn_sac_code}): ${newRate}%.`;

            await Notification.create({
                user_id: alert.user_id,
                type: "rate_change",
                message,
            });
        }
    } catch (err) {
        console.error("Notification dispatch error:", err);
    }
}

// ══════════════════════════════════════════════════════════
//  Rate Sync Management
// ══════════════════════════════════════════════════════════

const rateSyncService = require("../services/rateSyncService");
const scheduler = require("../services/scheduler");

// ── Trigger manual sync ───────────────────────────────────
router.post("/sync/trigger", async (req, res) => {
    try {
        const result = await rateSyncService.runSync("manual");
        res.json({ message: "Sync completed", result });
    } catch (err) {
        console.error("Manual sync error:", err);
        res.status(500).json({ error: "Sync failed: " + err.message });
    }
});

// ── Get last sync status ──────────────────────────────────
router.get("/sync/status", async (req, res) => {
    try {
        const status = await rateSyncService.getLastSyncStatus();
        const schedulerStatus = scheduler.getStatus();
        res.json({ ...status, scheduler: schedulerStatus });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sync status" });
    }
});

// ── Get sync logs ─────────────────────────────────────────
router.get("/sync/logs", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const data = await rateSyncService.getSyncLogs(parseInt(page), parseInt(limit));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch sync logs" });
    }
});

module.exports = router;
