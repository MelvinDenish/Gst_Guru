const express = require("express");
const router = express.Router();
const { GstReturn, Invoice, Expense } = require("../models");
const { authenticate } = require("../middleware/auth");
const { Op } = require("sequelize");

router.use(authenticate);

// Get all drafted/filed returns
router.get("/", async (req, res) => {
    try {
        const returns = await GstReturn.findAll({
            where: { user_id: req.user.id },
            order: [["period_year", "DESC"], ["period_month", "DESC"]],
        });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch returns" });
    }
});

// Generate GSTR-1 preparation data
router.get("/prepare/gstr1", async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: "Month and year required" });

        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        // Only fetch sales invoices
        const invoices = await Invoice.findAll({
            where: {
                user_id: req.user.id,
                invoice_type: "sale",
                invoice_date: { [Op.between]: [startDate, endDate] }
            }
        });

        // B2B and B2C grouping logic
        const b2b = invoices.filter(i => i.buyer_gstin && i.buyer_gstin.length > 5);
        const b2c = invoices.filter(i => !i.buyer_gstin || i.buyer_gstin.length <= 5);
        
        const summary = {
            total_b2b_sales: b2b.reduce((sum, i) => sum + Number(i.total), 0),
            total_b2c_sales: b2c.reduce((sum, i) => sum + Number(i.total), 0),
            total_cgst: invoices.reduce((sum, i) => sum + Number(i.cgst), 0),
            total_sgst: invoices.reduce((sum, i) => sum + Number(i.sgst), 0),
            total_igst: invoices.reduce((sum, i) => sum + Number(i.igst), 0),
            total_cess: invoices.reduce((sum, i) => sum + Number(i.cess), 0),
            invoice_count: invoices.length,
            invoices: invoices
        };

        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to prepare GSTR-1" });
    }
});

// Generate GSTR-3B preparation data
router.get("/prepare/gstr3b", async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: "Month and year required" });

        const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];

        // Sales (Outward supplies)
        const sales = await Invoice.findAll({
            where: { user_id: req.user.id, invoice_type: "sale", invoice_date: { [Op.between]: [startDate, endDate] } }
        });

        const liability = {
            cgst: sales.reduce((sum, i) => sum + Number(i.cgst), 0),
            sgst: sales.reduce((sum, i) => sum + Number(i.sgst), 0),
            igst: sales.reduce((sum, i) => sum + Number(i.igst), 0),
            total: sales.reduce((sum, i) => sum + Number(i.total), 0),
        };

        // Purchases & Expenses (Eligible ITC)
        const purchases = await Invoice.findAll({
            where: { user_id: req.user.id, invoice_type: "purchase", invoice_date: { [Op.between]: [startDate, endDate] } }
        });
        const expenses = await Expense.findAll({
            where: { user_id: req.user.id, eligible_itc: true, date: { [Op.between]: [startDate, endDate] } }
        });

        // Simplified ITC calculation (Assume evenly split for CGST/SGST, and IGST for state mismatch)
        const itcFromPurchases = purchases.reduce((sum, i) => sum + Number(i.cgst) + Number(i.sgst) + Number(i.igst), 0);
        const itcFromExpenses = expenses.reduce((sum, e) => sum + Number(e.gst_paid), 0);
        
        const totalItc = itcFromPurchases + itcFromExpenses;
        
        // Approximate split for summary
        const itc = {
            cgst: totalItc * 0.4,
            sgst: totalItc * 0.4,
            igst: totalItc * 0.2,
            total: totalItc
        };

        const summary = {
            liability,
            itc,
            net_payable: Math.max(0, (liability.cgst+liability.sgst+liability.igst) - totalItc)
        };

        res.json(summary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to prepare GSTR-3B" });
    }
});

// Save draft or file return
router.post("/", async (req, res) => {
    try {
        const gstr = await GstReturn.create({
            ...req.body,
            user_id: req.user.id,
        });
        res.status(201).json(gstr);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Failed to save return" });
    }
});

module.exports = router;
