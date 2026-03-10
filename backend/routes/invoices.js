const express = require("express");
const { Op } = require("sequelize");
const { Invoice } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ── List invoices with filters ───────────────────────────
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 20, status, type, from, to } = req.query;
        const where = { user_id: req.user.id };

        if (status) where.payment_status = status;
        if (type) where.invoice_type = type;
        if (from || to) {
            where.invoice_date = {};
            if (from) where.invoice_date[Op.gte] = from;
            if (to) where.invoice_date[Op.lte] = to;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await Invoice.findAndCountAll({
            where,
            order: [["invoice_date", "DESC"]],
            offset,
            limit: parseInt(limit),
        });

        res.json({
            invoices: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("Invoice list error:", err);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

// ── Get invoice stats ────────────────────────────────────
router.get("/stats", async (req, res) => {
    try {
        const userId = req.user.id;
        const all = await Invoice.findAll({ where: { user_id: userId } });

        const today = new Date().toISOString().split("T")[0];
        let totalRevenue = 0, totalOutstanding = 0, overdueCount = 0;
        let paidCount = 0, unpaidCount = 0, partialCount = 0;

        for (const inv of all) {
            totalRevenue += parseFloat(inv.total) || 0;
            if (inv.payment_status !== "paid") {
                const outstanding = parseFloat(inv.total) - (parseFloat(inv.amount_paid) || 0);
                totalOutstanding += outstanding;
                if (inv.due_date && inv.due_date < today) overdueCount++;
            }
            if (inv.payment_status === "paid") paidCount++;
            else if (inv.payment_status === "partial") partialCount++;
            else unpaidCount++;
        }

        res.json({
            total: all.length,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
            overdueCount,
            paidCount,
            unpaidCount,
            partialCount,
        });
    } catch (err) {
        console.error("Invoice stats error:", err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

// ── Create invoice ───────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const {
            invoice_type = "sale", buyer_name, buyer_gstin, buyer_address,
            seller_name, seller_gstin, invoice_date, due_date,
            place_of_supply, place_of_delivery, items, notes,
        } = req.body;

        if (!buyer_name || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Buyer name and at least one item required" });
        }

        // Calculate totals from items
        let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalCess = 0;
        const isInterState = place_of_supply && place_of_delivery && place_of_supply !== place_of_delivery;

        for (const item of items) {
            const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
            subtotal += lineTotal;
            const rate = parseFloat(item.gst_rate) || 0;
            const cess = parseFloat(item.cess_rate) || 0;

            if (isInterState) {
                totalIgst += (lineTotal * rate) / 100;
            } else {
                totalCgst += (lineTotal * (rate / 2)) / 100;
                totalSgst += (lineTotal * (rate / 2)) / 100;
            }
            totalCess += (lineTotal * cess) / 100;
        }

        const total = subtotal + totalCgst + totalSgst + totalIgst + totalCess;

        // Generate invoice number
        const count = await Invoice.count({ where: { user_id: req.user.id } });
        const prefix = invoice_type === "sale" ? "SAL" : "PUR";
        const invoice_number = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

        const invoice = await Invoice.create({
            user_id: req.user.id,
            invoice_number,
            invoice_type,
            buyer_name,
            buyer_gstin: buyer_gstin || null,
            buyer_address: buyer_address || null,
            seller_name: seller_name || req.user.name,
            seller_gstin: seller_gstin || null,
            invoice_date: invoice_date || new Date().toISOString().split("T")[0],
            due_date: due_date || null,
            place_of_supply: place_of_supply || null,
            place_of_delivery: place_of_delivery || null,
            items_json: items,
            subtotal: parseFloat(subtotal.toFixed(2)),
            cgst: parseFloat(totalCgst.toFixed(2)),
            sgst: parseFloat(totalSgst.toFixed(2)),
            igst: parseFloat(totalIgst.toFixed(2)),
            cess: parseFloat(totalCess.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            notes: notes || null,
        });

        res.status(201).json({ invoice });
    } catch (err) {
        console.error("Invoice create error:", err);
        res.status(500).json({ error: "Failed to create invoice" });
    }
});

// ── Update invoice ───────────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        const fields = req.body;
        if (fields.items) {
            fields.items_json = fields.items;
            delete fields.items;

            // Recalculate totals
            let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, totalCess = 0;
            const isInterState = (fields.place_of_supply || invoice.place_of_supply) &&
                (fields.place_of_delivery || invoice.place_of_delivery) &&
                (fields.place_of_supply || invoice.place_of_supply) !== (fields.place_of_delivery || invoice.place_of_delivery);

            for (const item of fields.items_json) {
                const lineTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
                subtotal += lineTotal;
                const rate = parseFloat(item.gst_rate) || 0;
                const cess = parseFloat(item.cess_rate) || 0;
                if (isInterState) {
                    totalIgst += (lineTotal * rate) / 100;
                } else {
                    totalCgst += (lineTotal * (rate / 2)) / 100;
                    totalSgst += (lineTotal * (rate / 2)) / 100;
                }
                totalCess += (lineTotal * cess) / 100;
            }
            fields.subtotal = parseFloat(subtotal.toFixed(2));
            fields.cgst = parseFloat(totalCgst.toFixed(2));
            fields.sgst = parseFloat(totalSgst.toFixed(2));
            fields.igst = parseFloat(totalIgst.toFixed(2));
            fields.cess = parseFloat(totalCess.toFixed(2));
            fields.total = parseFloat((subtotal + totalCgst + totalSgst + totalIgst + totalCess).toFixed(2));
        }

        await invoice.update(fields);
        res.json({ invoice });
    } catch (err) {
        console.error("Invoice update error:", err);
        res.status(500).json({ error: "Failed to update invoice" });
    }
});

// ── Update payment status ────────────────────────────────
router.patch("/:id/status", async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        const { payment_status, amount_paid } = req.body;
        const updates = {};
        if (payment_status) updates.payment_status = payment_status;
        if (amount_paid !== undefined) updates.amount_paid = parseFloat(amount_paid);

        await invoice.update(updates);
        res.json({ invoice });
    } catch (err) {
        console.error("Invoice status update error:", err);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// ── Delete invoice ───────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!invoice) return res.status(404).json({ error: "Invoice not found" });

        await invoice.destroy();
        res.json({ message: "Invoice deleted" });
    } catch (err) {
        console.error("Invoice delete error:", err);
        res.status(500).json({ error: "Failed to delete invoice" });
    }
});

module.exports = router;
