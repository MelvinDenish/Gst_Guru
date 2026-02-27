const express = require("express");
const { Calculation } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ── List calculation history ──────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Calculation.findAndCountAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]],
            offset,
            limit: parseInt(limit),
        });

        res.json({
            calculations: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("History fetch error:", err);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// ── Export history as CSV ─────────────────────────────────
router.get("/export", async (req, res) => {
    try {
        const calculations = await Calculation.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]],
        });

        const headers = [
            "Date", "HSN/SAC", "Description", "Taxable Value", "Quantity",
            "Rate %", "CGST", "SGST", "IGST", "Cess", "Total",
            "Transaction Type", "Supply State", "Consumption State",
        ];

        const rows = calculations.map((c) => [
            new Date(c.created_at).toLocaleDateString("en-IN"),
            c.hsn_sac_code,
            `"${(c.product_description || "").replace(/"/g, '""')}"`,
            c.taxable_value,
            c.quantity,
            c.rate_used,
            c.cgst,
            c.sgst,
            c.igst,
            c.cess,
            c.total,
            c.transaction_type,
            c.place_of_supply || "",
            c.place_of_consumption || "",
        ]);

        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=gst_calculations.csv");
        res.send(csv);
    } catch (err) {
        console.error("Export error:", err);
        res.status(500).json({ error: "Export failed" });
    }
});

module.exports = router;
