const express = require("express");
const router = express.Router();
const { Expense } = require("../models");
const { authenticate } = require("../middleware/auth");
const { Op } = require("sequelize");

router.use(authenticate);

// Get all expenses
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.findAll({
            where: { user_id: req.user.id },
            order: [["date", "DESC"]],
        });
        res.json(expenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
});

// Create new expense
router.post("/", async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            user_id: req.user.id,
        });
        res.status(201).json(expense);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to create expense" });
    }
});

// Update an expense
router.put("/:id", async (req, res) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!expense) return res.status(404).json({ error: "Not found" });

        await expense.update(req.body);
        res.json(expense);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to update expense" });
    }
});

// Delete an expense
router.delete("/:id", async (req, res) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!expense) return res.status(404).json({ error: "Not found" });

        await expense.destroy();
        res.json({ message: "Expense deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

// Get expense summary
router.get("/summary", async (req, res) => {
    try {
        const expenses = await Expense.findAll({ where: { user_id: req.user.id } });
        const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalGst = expenses.reduce((sum, e) => sum + Number(e.gst_paid), 0);
        const eligibleItc = expenses.filter(e => e.eligible_itc).reduce((sum, e) => sum + Number(e.gst_paid), 0);
        
        res.json({ totalAmount, totalGst, eligibleItc });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch summary" });
    }
});

module.exports = router;
