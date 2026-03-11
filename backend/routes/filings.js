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
