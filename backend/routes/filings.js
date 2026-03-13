const express = require("express");
const { Op } = require("sequelize");
const { FilingRecord } = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// Standard GST filing deadlines
const FILING_DEADLINES = {
    "GSTR-1": { day: 11, frequency: "monthly", description: "Outward supplies" },
    "GSTR-3B": { day: 20, frequency: "monthly", description: "Summary return" },
    "GSTR-9": { day: 31, month: 12, frequency: "annual", description: "Annual return" },
    "GSTR-9C": { day: 31, month: 12, frequency: "annual", description: "Reconciliation statement" },
    "CMP-08": { day: 18, frequency: "quarterly", description: "Composition scheme" },
    "GSTR-4": { day: 30, month: 4, frequency: "annual", description: "Composition annual" },
};

// ── List filing records ──────────────────────────────────
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 20, return_type, status, financial_year } = req.query;
        const where = { user_id: req.user.id };

        if (return_type) where.return_type = return_type;
        if (status) where.status = status;
        if (financial_year) where.financial_year = financial_year;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { count, rows } = await FilingRecord.findAndCountAll({
            where,
            order: [["due_date", "DESC"]],
            offset,
            limit: parseInt(limit),
        });

        res.json({
            filings: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error("Filings list error:", err);
        res.status(500).json({ error: "Failed to fetch filings" });
    }
});

// ── Get upcoming deadlines ───────────────────────────────
router.get("/upcoming", async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const upcoming = await FilingRecord.findAll({
            where: {
                user_id: req.user.id,
                status: { [Op.in]: ["pending", "draft"] },
                due_date: { [Op.gte]: today },
            },
            order: [["due_date", "ASC"]],
            limit: 10,
        });

        const overdue = await FilingRecord.findAll({
            where: {
                user_id: req.user.id,
                status: { [Op.in]: ["pending", "draft"] },
                due_date: { [Op.lt]: today },
            },
            order: [["due_date", "ASC"]],
        });

        res.json({ upcoming, overdue, deadlineInfo: FILING_DEADLINES });
    } catch (err) {
        console.error("Upcoming filings error:", err);
        res.status(500).json({ error: "Failed to fetch upcoming filings" });
    }
});

// ── Tax Calendar ─────────────────────────────────────────
router.get("/calendar", async (req, res) => {
    try {
        const userId = req.user.id;
        const { months = 3 } = req.query;
        const now = new Date();
        const events = [];

        // Auto-generate upcoming deadlines for next N months
        for (let m = 0; m < parseInt(months); m++) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
            const year = targetDate.getFullYear();
            const month = targetDate.getMonth();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            for (const [returnType, info] of Object.entries(FILING_DEADLINES)) {
                if (info.frequency === "monthly") {
                    const deadline = new Date(year, month, info.day);
                    if (deadline >= now) {
                        events.push({
                            id: `auto-${returnType}-${year}-${month}`,
                            return_type: returnType,
                            description: info.description,
                            due_date: deadline.toISOString().split("T")[0],
                            period: `${monthNames[month]} ${year}`,
                            type: "auto",
                            urgency: (deadline - now) / (1000 * 60 * 60 * 24) <= 3 ? "urgent" :
                                (deadline - now) / (1000 * 60 * 60 * 24) <= 7 ? "warning" : "normal",
                        });
                    }
                } else if (info.frequency === "quarterly" && [2, 5, 8, 11].includes(month)) {
                    const deadline = new Date(year, month, info.day);
                    if (deadline >= now) {
                        events.push({
                            id: `auto-${returnType}-${year}-${month}`,
                            return_type: returnType,
                            description: info.description,
                            due_date: deadline.toISOString().split("T")[0],
                            period: `Q${Math.floor(month / 3) + 1} ${year}`,
                            type: "auto",
                            urgency: (deadline - now) / (1000 * 60 * 60 * 24) <= 3 ? "urgent" :
                                (deadline - now) / (1000 * 60 * 60 * 24) <= 7 ? "warning" : "normal",
                        });
                    }
                }
            }
        }

        // Merge with user's actual filing records
        const userFilings = await FilingRecord.findAll({
            where: { user_id: userId },
            order: [["due_date", "ASC"]],
        });

        for (const f of userFilings) {
            events.push({
                id: f.id,
                return_type: f.return_type,
                description: FILING_DEADLINES[f.return_type]?.description || f.return_type,
                due_date: f.due_date,
                period: f.period,
                status: f.status,
                type: "user",
                urgency: f.status === "filed" ? "done" :
                    new Date(f.due_date) < now ? "overdue" : "normal",
            });
        }

        // Sort by date
        events.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

        res.json({ events, deadlineInfo: FILING_DEADLINES });
    } catch (err) {
        console.error("Calendar error:", err);
        res.status(500).json({ error: "Failed to fetch calendar" });
    }
});

// ── Smart Filing Reminders with Penalty Estimates ────────
router.get("/smart-reminders", async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Get pending/draft filings
        const pendingFilings = await FilingRecord.findAll({
            where: {
                user_id: userId,
                status: { [Op.in]: ["pending", "draft"] },
            },
            order: [["due_date", "ASC"]],
        });

        // Estimate tax liability from recent invoices (last 3 months)
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
            .toISOString().split("T")[0];

        const { Invoice } = require("../models");
        const recentSales = await Invoice.findAll({
            where: {
                user_id: userId,
                invoice_type: "sale",
                invoice_date: { [Op.gte]: threeMonthsAgo },
            },
        });
        const recentPurchases = await Invoice.findAll({
            where: {
                user_id: userId,
                invoice_type: "purchase",
                invoice_date: { [Op.gte]: threeMonthsAgo },
            },
        });

        // Monthly average tax liability
        const totalOutputTax = recentSales.reduce((s, i) =>
            s + (parseFloat(i.cgst) || 0) + (parseFloat(i.sgst) || 0) +
            (parseFloat(i.igst) || 0) + (parseFloat(i.cess) || 0), 0);
        const totalInputTax = recentPurchases.reduce((s, i) =>
            s + (parseFloat(i.cgst) || 0) + (parseFloat(i.sgst) || 0) +
            (parseFloat(i.igst) || 0) + (parseFloat(i.cess) || 0), 0);
        const monthsWithData = Math.max(1, 3);
        const avgMonthlyLiability = Math.max(0, (totalOutputTax - totalInputTax) / monthsWithData);

        const reminders = pendingFilings.map(f => {
            const dueDate = new Date(f.due_date);
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntilDue < 0;
            const daysLate = isOverdue ? Math.abs(daysUntilDue) : 0;

            // Estimate penalty if missed/overdue
            const estimatedLiability = f.total_liability > 0
                ? parseFloat(f.total_liability)
                : avgMonthlyLiability;

            let lateFeePerDay = estimatedLiability > 0 ? 50 : 20;
            let maxLateFee = 5000;
            if (f.return_type === "GSTR-9") {
                lateFeePerDay = 200;
                maxLateFee = 15000;
            }

            const estimatedLateFee = isOverdue
                ? Math.min(daysLate * lateFeePerDay, maxLateFee)
                : Math.min(1 * lateFeePerDay, maxLateFee); // 1 day late estimate

            const interestRate = 0.18;
            const estimatedInterest = isOverdue && estimatedLiability > 0
                ? parseFloat(((estimatedLiability * interestRate * daysLate) / 365).toFixed(2))
                : 0;

            // Urgency level
            let urgency;
            if (isOverdue) urgency = "overdue";
            else if (daysUntilDue <= 2) urgency = "critical";
            else if (daysUntilDue <= 5) urgency = "urgent";
            else if (daysUntilDue <= 10) urgency = "warning";
            else urgency = "normal";

            // Actionable message
            let actionMessage;
            if (isOverdue) {
                actionMessage = `⛔ OVERDUE by ${daysLate} days! Current penalty: ₹${(estimatedLateFee + estimatedInterest).toLocaleString("en-IN")}. File immediately to stop penalty accumulation.`;
            } else if (daysUntilDue <= 2) {
                actionMessage = `🔴 Due in ${daysUntilDue} day(s)! Estimated liability: ₹${estimatedLiability.toLocaleString("en-IN")}. Missing deadline will cost ₹${lateFeePerDay}/day.`;
            } else if (daysUntilDue <= 5) {
                actionMessage = `🟠 Due in ${daysUntilDue} days. Prepare your filing now. Estimated liability: ₹${estimatedLiability.toLocaleString("en-IN")}.`;
            } else {
                actionMessage = `🟢 Due in ${daysUntilDue} days. Estimated liability: ₹${estimatedLiability.toLocaleString("en-IN")}.`;
            }

            return {
                id: f.id,
                return_type: f.return_type,
                period: f.period,
                due_date: f.due_date,
                days_until_due: daysUntilDue,
                is_overdue: isOverdue,
                days_late: daysLate,
                urgency,
                estimated_liability: parseFloat(estimatedLiability.toFixed(2)),
                penalty_estimate: {
                    late_fee: parseFloat(estimatedLateFee.toFixed(2)),
                    interest: estimatedInterest,
                    total: parseFloat((estimatedLateFee + estimatedInterest).toFixed(2)),
                    late_fee_per_day: lateFeePerDay,
                },
                action_message: actionMessage,
                description: FILING_DEADLINES[f.return_type]?.description || f.return_type,
            };
        });

        // Sort: overdue first, then by urgency
        const urgencyOrder = { overdue: 0, critical: 1, urgent: 2, warning: 3, normal: 4 };
        reminders.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

        const overdueCount = reminders.filter(r => r.is_overdue).length;
        const criticalCount = reminders.filter(r => r.urgency === "critical").length;
        const totalPenaltyAtRisk = reminders.reduce((s, r) => s + r.penalty_estimate.total, 0);

        res.json({
            reminders,
            summary: {
                total: reminders.length,
                overdue: overdueCount,
                critical: criticalCount,
                total_penalty_at_risk: parseFloat(totalPenaltyAtRisk.toFixed(2)),
                avg_monthly_liability: parseFloat(avgMonthlyLiability.toFixed(2)),
            },
        });
    } catch (err) {
        console.error("Smart reminders error:", err);
        res.status(500).json({ error: "Failed to generate reminders" });
    }
});

// ── Create filing record ─────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const {
            return_type, period, financial_year, due_date,
            filing_date, status, total_liability, itc_claimed,
            tax_paid, late_fee, arn_number, notes,
        } = req.body;

        if (!return_type || !period || !financial_year || !due_date) {
            return res.status(400).json({
                error: "Return type, period, financial year, and due date are required",
            });
        }

        const filing = await FilingRecord.create({
            user_id: req.user.id,
            return_type,
            period,
            financial_year,
            due_date,
            filing_date: filing_date || null,
            status: status || "pending",
            total_liability: total_liability || 0,
            itc_claimed: itc_claimed || 0,
            tax_paid: tax_paid || 0,
            late_fee: late_fee || 0,
            arn_number: arn_number || null,
            notes: notes || null,
        });

        res.status(201).json({ filing });
    } catch (err) {
        console.error("Filing create error:", err);
        res.status(500).json({ error: "Failed to create filing record" });
    }
});

// ── Update filing record ─────────────────────────────────
router.put("/:id", async (req, res) => {
    try {
        const filing = await FilingRecord.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!filing) return res.status(404).json({ error: "Filing record not found" });

        await filing.update(req.body);
        res.json({ filing });
    } catch (err) {
        console.error("Filing update error:", err);
        res.status(500).json({ error: "Failed to update filing" });
    }
});

// ── Delete filing record ─────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        const filing = await FilingRecord.findOne({
            where: { id: req.params.id, user_id: req.user.id },
        });
        if (!filing) return res.status(404).json({ error: "Filing record not found" });

        await filing.destroy();
        res.json({ message: "Filing record deleted" });
    } catch (err) {
        console.error("Filing delete error:", err);
        res.status(500).json({ error: "Failed to delete filing" });
    }
});

module.exports = router;
