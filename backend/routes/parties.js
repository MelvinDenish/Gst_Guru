const express = require("express");
const router = express.Router();
const { Party } = require("../models");
const { authenticate } = require("../middleware/auth");

router.use(authenticate);

// Get all parties
router.get("/", async (req, res) => {
    try {
        const whereClause = { user_id: req.user.id };
        if (req.query.type) {
            whereClause.type = req.query.type;
        }
        
        const parties = await Party.findAll({
            where: whereClause,
            order: [["name", "ASC"]],
        });
        res.json(parties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch parties" });
    }
});

// Create new party
router.post("/", async (req, res) => {
    try {
        const party = await Party.create({
            ...req.body,
            user_id: req.user.id,
        });
        res.status(201).json(party);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to create party" });
    }
});

// Update party
router.put("/:id", async (req, res) => {
    try {
        const party = await Party.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!party) return res.status(404).json({ error: "Not found" });

        await party.update(req.body);
        res.json(party);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to update party" });
    }
});

// Delete party
router.delete("/:id", async (req, res) => {
    try {
        const party = await Party.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!party) return res.status(404).json({ error: "Not found" });

        await party.destroy();
        res.json({ message: "Party deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete party" });
    }
});

module.exports = router;
