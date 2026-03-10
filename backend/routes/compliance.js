const express = require("express");
const { Op } = require("sequelize");
const { ComplianceReport, Invoice, FilingRecord, Calculation } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ── List compliance reports ──────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 20, report_type, financial_year } = req.query;
        const where = { user_id: req.user.id };

        if (report_type) where.report_type = report_type;
        if (financial_year) where.financial_year = financial_year;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await ComplianceReport.findAndCountAll({
            where,
            order: [["createdAt", "DESC"]],
            offset,
            limit: parseInt(limit),
        });

        res.json({
            reports: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("Compliance list error:", err);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

// ── Get report detail ────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const report = await ComplianceReport.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!report) return res.status(404).json({ error: "Report not found" });
        res.json({ report });
    } catch (err) {
        console.error("Compliance detail error:", err);
        res.status(500).json({ error: "Failed to fetch report" });
    }
});

// ── Generate compliance report ───────────────────────────
router.post("/generate", async (req, res) => {
    try {
        const { report_type = "monthly", period, financial_year } = req.body;

        if (!period || !financial_year) {
            return res.status(400).json({ error: "Period and financial year are required" });
        }

        const userId = req.user.id;

        // Gather data from invoices
        const saleInvoices = await Invoice.findAll({
            where: { user_id: userId, invoice_type: "sale" },
        });
        const purchaseInvoices = await Invoice.findAll({
            where: { user_id: userId, invoice_type: "purchase" },
        });

        const totalSales = saleInvoices.reduce((sum, inv) => sum + (parseFloat(inv.subtotal) || 0), 0);
        const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + (parseFloat(inv.subtotal) || 0), 0);

        const outputTax = saleInvoices.reduce((sum, inv) => {
            return sum + (parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0) +
                (parseFloat(inv.igst) || 0) + (parseFloat(inv.cess) || 0);
        }, 0);

        const inputTax = purchaseInvoices.reduce((sum, inv) => {
            return sum + (parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0) +
                (parseFloat(inv.igst) || 0) + (parseFloat(inv.cess) || 0);
        }, 0);

        const netLiability = Math.max(0, outputTax - inputTax);

        // Check filings
        const filings = await FilingRecord.findAll({ where: { user_id: userId } });
        const filingsOnTime = filings.filter(f => f.status === "filed").length;
        const filingsLate = filings.filter(f => f.status === "late").length;

        // Calculate compliance score
        const alerts = [];
        let score = 100;

        if (filingsLate > 0) {
            score -= filingsLate * 15;
            alerts.push({ type: "warning", message: `${filingsLate} filing(s) were submitted late` });
        }

        const pendingFilings = filings.filter(f => f.status === "pending" || f.status === "draft");
        const today = new Date().toISOString().split("T")[0];
        const overdueFilings = pendingFilings.filter(f => f.due_date && f.due_date < today);
        if (overdueFilings.length > 0) {
            score -= overdueFilings.length * 20;
            alerts.push({ type: "danger", message: `${overdueFilings.length} filing(s) are overdue` });
        }

        const unpaidInvoices = saleInvoices.filter(i => i.payment_status === "unpaid");
        if (unpaidInvoices.length > 5) {
            score -= 10;
            alerts.push({ type: "info", message: `${unpaidInvoices.length} sale invoices are unpaid` });
        }

        if (totalSales === 0 && totalPurchases === 0) {
            alerts.push({ type: "info", message: "No invoices found. Add invoices for accurate reporting." });
        }

        if (score >= 80) {
            alerts.push({ type: "success", message: "Good compliance standing" });
        }

        score = Math.max(0, Math.min(100, score));

        const report = await ComplianceReport.create({
            user_id: userId,
            report_type,
            period,
            financial_year,
            total_sales: parseFloat(totalSales.toFixed(2)),
            total_purchases: parseFloat(totalPurchases.toFixed(2)),
            output_tax: parseFloat(outputTax.toFixed(2)),
            input_tax: parseFloat(inputTax.toFixed(2)),
            net_liability: parseFloat(netLiability.toFixed(2)),
            compliance_score: score,
            total_invoices: saleInvoices.length + purchaseInvoices.length,
            filings_on_time: filingsOnTime,
            filings_late: filingsLate,
            alerts_json: alerts,
        });

        res.status(201).json({ report });
    } catch (err) {
        console.error("Compliance generate error:", err);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

// ── Export report as CSV ─────────────────────────────────
router.get("/export/:id", async (req, res) => {
    try {
        const report = await ComplianceReport.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!report) return res.status(404).json({ error: "Report not found" });

        const headers = [
            "Report Type", "Period", "Financial Year", "Total Sales",
            "Total Purchases", "Output Tax", "Input Tax", "Net Liability",
            "Compliance Score", "Total Invoices", "Filings On Time", "Filings Late",
        ];

        const values = [
            report.report_type, report.period, report.financial_year,
            report.total_sales, report.total_purchases, report.output_tax,
            report.input_tax, report.net_liability, report.compliance_score,
            report.total_invoices, report.filings_on_time, report.filings_late,
        ];

        const csv = [headers.join(","), values.join(",")].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=compliance_${report.period}.csv`);
        res.send(csv);
    } catch (err) {
        console.error("Compliance export error:", err);
        res.status(500).json({ error: "Export failed" });
    }
});

module.exports = router;
