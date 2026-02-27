const express = require("express");
const { Category } = require("../models");

const router = express.Router();

// ── Public: list categories (tree structure) ──────────────
router.get("/", async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { parent_id: null },
            include: [
                {
                    model: Category,
                    as: "children",
                    include: [{ model: Category, as: "children" }],
                },
            ],
            order: [["name", "ASC"]],
        });

        res.json({ categories });
    } catch (err) {
        console.error("Categories fetch error:", err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

module.exports = router;
