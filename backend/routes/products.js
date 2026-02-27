const express = require("express");
const { BusinessProduct, GstRate, Category } = require("../models");
const { authenticate } = require("../middleware/auth");
const { Op } = require("sequelize");

const router = express.Router();

// All routes require auth
router.use(authenticate);

// ── List user's products ──────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const products = await BusinessProduct.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]],
        });

        // Enrich with current GST rate
        const today = new Date().toISOString().split("T")[0];
        const enriched = await Promise.all(
            products.map(async (p) => {
                const rate = await GstRate.findOne({
                    where: {
                        hsn_sac_code: p.hsn_sac_code,
                        effective_from: { [Op.lte]: today },
                        [Op.or]: [
                            { effective_to: null },
                            { effective_to: { [Op.gte]: today } },
                        ],
                    },
                    include: [{ model: Category, attributes: ["id", "name"] }],
                });
                return {
                    ...p.toJSON(),
                    current_rate: rate ? parseFloat(rate.rate_percent) : null,
                    current_cess: rate ? parseFloat(rate.cess_percent) : 0,
                    category: rate?.Category?.name || null,
                };
            })
        );

        res.json({ products: enriched });
    } catch (err) {
        console.error("Products fetch error:", err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// ── Add product ───────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { hsn_sac_code, description, default_rate } = req.body;

        if (!hsn_sac_code || !description) {
            return res.status(400).json({ error: "HSN/SAC code and description are required" });
        }

        const product = await BusinessProduct.create({
            user_id: req.user.id,
            hsn_sac_code,
            description,
            default_rate: default_rate || null,
        });

        res.status(201).json({ product });
    } catch (err) {
        console.error("Product create error:", err);
        res.status(500).json({ error: "Failed to create product" });
    }
});

// ── Update product ────────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const product = await BusinessProduct.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const { hsn_sac_code, description, default_rate } = req.body;
        if (hsn_sac_code) product.hsn_sac_code = hsn_sac_code;
        if (description) product.description = description;
        if (default_rate !== undefined) product.default_rate = default_rate;

        await product.save();
        res.json({ product });
    } catch (err) {
        console.error("Product update error:", err);
        res.status(500).json({ error: "Failed to update product" });
    }
});

// ── Delete product ────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await BusinessProduct.destroy({
            where: { id: req.params.id, user_id: req.user.id },
        });

        if (!deleted) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({ message: "Product deleted" });
    } catch (err) {
        console.error("Product delete error:", err);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

module.exports = router;
