const express = require("express");
const { Op } = require("sequelize");
const { GstRate, Category } = require("../models");

const router = express.Router();

// ── Public: search / lookup rates ─────────────────────────
router.get("/", async (req, res) => {
    try {
        const { hsn, q, category, slab, page = 1, limit = 50 } = req.query;
        const where = {};
        const today = new Date().toISOString().split("T")[0];

        // Only show currently active rates
        where.effective_from = { [Op.lte]: today };
        where[Op.or] = [
            { effective_to: null },
            { effective_to: { [Op.gte]: today } },
        ];

        if (hsn) {
            where.hsn_sac_code = { [Op.like]: `${hsn}%` };
        }

        if (q) {
            where.description = { [Op.like]: `%${q}%` };
        }

        if (slab !== undefined && slab !== "") {
            where.rate_percent = parseFloat(slab);
        }

        const include = [{ model: Category, attributes: ["id", "name"] }];

        if (category) {
            include[0].where = { name: category };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await GstRate.findAndCountAll({
            where,
            include,
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
        console.error("Rates fetch error:", err);
        res.status(500).json({ error: "Failed to fetch rates" });
    }
});

// ── Public: get rate by HSN code ──────────────────────────
router.get("/:hsn", async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const rate = await GstRate.findOne({
            where: {
                hsn_sac_code: req.params.hsn,
                effective_from: { [Op.lte]: today },
                [Op.or]: [
                    { effective_to: null },
                    { effective_to: { [Op.gte]: today } },
                ],
            },
            include: [{ model: Category, attributes: ["id", "name"] }],
        });

        if (!rate) {
            return res.status(404).json({ error: "Rate not found for this HSN/SAC code" });
        }

        res.json({ rate });
    } catch (err) {
        console.error("Rate lookup error:", err);
        res.status(500).json({ error: "Failed to lookup rate" });
    }
});

module.exports = router;
