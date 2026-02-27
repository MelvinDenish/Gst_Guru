const express = require("express");
const { Notification } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ── List notifications ────────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: req.user.id },
            order: [["created_at", "DESC"]],
            limit: 50,
        });

        const unreadCount = await Notification.count({
            where: { user_id: req.user.id, read_at: null },
        });

        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error("Notifications fetch error:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

// ── Mark as read ──────────────────────────────────────────
router.patch("/:id/read", async (req, res) => {
    try {
        const notification = await Notification.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        notification.read_at = new Date();
        await notification.save();
        res.json({ notification });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notification" });
    }
});

// ── Mark all as read ──────────────────────────────────────
router.patch("/read-all", async (req, res) => {
    try {
        await Notification.update(
            { read_at: new Date() },
            { where: { user_id: req.user.id, read_at: null } }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

module.exports = router;
