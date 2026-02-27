const express = require("express");
const { RateAlert } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ── List user's alert subscriptions ───────────────────────
router.get("/", async (req, res) => {
    try {
        const alerts = await RateAlert.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]],
        });
        res.json({ alerts });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch alerts" });
    }
});

// ── Subscribe to HSN code alerts ──────────────────────────
router.post("/", async (req, res) => {
    try {
        const { hsn_sac_code } = req.body;
        if (!hsn_sac_code) {
            return res.status(400).json({ error: "HSN/SAC code is required" });
        }

        const existing = await RateAlert.findOne({
            where: { user_id: req.user.id, hsn_sac_code },
        });

        if (existing) {
            return res.status(409).json({ error: "Already subscribed to this code" });
        }

        const alert = await RateAlert.create({
            user_id: req.user.id,
            hsn_sac_code,
        });

        res.status(201).json({ alert });
    } catch (err) {
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

// ── Unsubscribe from alerts ───────────────────────────────
router.delete("/:hsn", async (req, res) => {
    try {
        const deleted = await RateAlert.destroy({
            where: { user_id: req.user.id, hsn_sac_code: req.params.hsn },
        });

        if (!deleted) {
            return res.status(404).json({ error: "Subscription not found" });
        }

        res.json({ message: "Unsubscribed" });
    } catch (err) {
        res.status(500).json({ error: "Failed to unsubscribe" });
    }
});

module.exports = router;
