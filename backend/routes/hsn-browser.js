const express = require("express");
const { Op } = require("sequelize");
const { GstRate, Category } = require("../models");

const router = express.Router();

// ── Get all categories with rate counts ──────────────────
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: GstRate,
                attributes: ["id"],
            }],
            order: [["name", "ASC"]],
        });

        res.json({
            categories: categories.map(c => ({
                id: c.id,
                name: c.name,
                hsn_range: c.hsn_sac_range,
                parent_id: c.parent_id,
                count: c.GstRates ? c.GstRates.length : 0,
            })),
        });
    } catch (err) {
        console.error("HSN categories error:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// ── Browse HSN codes by category ─────────────────────────
router.get("/browse", async (req, res) => {
    try {
        const {
            category_id, rate, search, page = 1, limit = 50,
        } = req.query;

        const where = {};
        if (category_id) where.category_id = category_id;
        if (rate) where.rate_percent = parseFloat(rate);
        if (search) {
            where[Op.or] = [
                { hsn_sac_code: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await GstRate.findAndCountAll({
            where,
            include: [{ model: Category, attributes: ["id", "name", "hsn_sac_range"] }],
            order: [["hsn_sac_code", "ASC"]],
            offset,
            limit: parseInt(limit),
        });

        // Rate distribution stats
        const allRates = await GstRate.findAll({
            where: category_id ? { category_id } : {},
            attributes: ["rate_percent"],
        });

        const distribution = {};
        for (const r of allRates) {
            const pct = r.rate_percent;
            distribution[pct] = (distribution[pct] || 0) + 1;
        }

        res.json({
            rates: rows.map(r => ({
                id: r.id,
                hsn_sac_code: r.hsn_sac_code,
                description: r.description,
                rate_percent: r.rate_percent,
                cess_percent: r.cess_percent,
                is_rcm: r.is_rcm,
                effective_from: r.effective_from,
                category: r.Category?.name || null,
                category_range: r.Category?.hsn_sac_range || null,
            })),
            distribution,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("HSN browse error:", err);
        res.status(500).json({ error: "Failed to browse HSN codes" });
    }
});

// ── Get rate statistics ──────────────────────────────────
router.get("/stats", async (req, res) => {
    try {
        const total = await GstRate.count();

        const allRates = await GstRate.findAll({ attributes: ["rate_percent", "cess_percent", "is_rcm"] });
        const distribution = {};
        let withCess = 0, rcmCount = 0;
        for (const r of allRates) {
            const pct = r.rate_percent;
            distribution[pct] = (distribution[pct] || 0) + 1;
            if (r.cess_percent > 0) withCess++;
            if (r.is_rcm) rcmCount++;
        }

        const categories = await Category.count();

        res.json({
            total,
            categories,
            distribution,
            withCess,
            rcmCount,
        });
    } catch (err) {
        console.error("HSN stats error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

module.exports = router;
