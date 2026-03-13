const express = require("express");
const { Op } = require("sequelize");
const {
    BusinessProduct, GstRate, Category, Invoice,
    FilingRecord, Calculation,
} = require("../models");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ══════════════════════════════════════════════════════════
//  1. Overpayment / Underpayment Detector
// ══════════════════════════════════════════════════════════
router.get("/overpay-check", async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0];

        // Fetch user's saved products
        const products = await BusinessProduct.findAll({
            where: { user_id: userId },
        });

        if (products.length === 0) {
            return res.json({
                products: [],
                summary: {
                    total_products: 0,
                    mismatched: 0,
                    overpaying: 0,
                    underpaying: 0,
                    correct: 0,
                    monthly_impact: 0,
                    annual_impact: 0,
                },
                message: "Add products with default_rate to enable overpay detection.",
            });
        }

        const results = [];
        let overpaying = 0, underpaying = 0, correct = 0;
        let totalMonthlyImpact = 0;

        for (const product of products) {
            // Find current active rate for this HSN code
            const currentRate = await GstRate.findOne({
                where: {
                    hsn_sac_code: product.hsn_sac_code,
                    effective_from: { [Op.lte]: today },
                    [Op.or]: [
                        { effective_to: null },
                        { effective_to: { [Op.gte]: today } },
                    ],
                },
                include: [{ model: Category, attributes: ["id", "name"] }],
            });

            if (!currentRate) {
                results.push({
                    id: product.id,
                    hsn_sac_code: product.hsn_sac_code,
                    description: product.description,
                    your_rate: product.default_rate,
                    system_rate: null,
                    status: "unknown",
                    message: "HSN code not found in system",
                });
                continue;
            }

            const systemRate = parseFloat(currentRate.rate_percent);
            const userRate = product.default_rate !== null ? parseFloat(product.default_rate) : null;

            if (userRate === null) {
                results.push({
                    id: product.id,
                    hsn_sac_code: product.hsn_sac_code,
                    description: product.description,
                    your_rate: null,
                    system_rate: systemRate,
                    cess_rate: parseFloat(currentRate.cess_percent) || 0,
                    category: currentRate.Category?.name || null,
                    rate_description: currentRate.description,
                    status: "no_rate_set",
                    message: "No default rate set — set your charging rate to enable comparison",
                });
                continue;
            }

            const diff = userRate - systemRate;
            let status, message;
            const monthlyVolume = product.monthly_volume || 0;
            const unitPrice = product.unit_price || 0;
            let monthlyImpact = 0;

            if (Math.abs(diff) < 0.01) {
                status = "correct";
                message = "Rate is correct ✅";
                correct++;
            } else if (diff > 0) {
                status = "overpaying";
                message = `Overcharging by ${diff.toFixed(1)}% — customers pay more than required`;
                overpaying++;
                if (monthlyVolume > 0 && unitPrice > 0) {
                    monthlyImpact = -((unitPrice * monthlyVolume * diff) / 100);
                    totalMonthlyImpact += monthlyImpact;
                }
            } else {
                status = "underpaying";
                message = `Undercharging by ${Math.abs(diff).toFixed(1)}% — you may face audit risk`;
                underpaying++;
                if (monthlyVolume > 0 && unitPrice > 0) {
                    monthlyImpact = (unitPrice * monthlyVolume * Math.abs(diff)) / 100;
                    totalMonthlyImpact += monthlyImpact;
                }
            }

            results.push({
                id: product.id,
                hsn_sac_code: product.hsn_sac_code,
                description: product.description,
                your_rate: userRate,
                system_rate: systemRate,
                cess_rate: parseFloat(currentRate.cess_percent) || 0,
                category: currentRate.Category?.name || null,
                rate_description: currentRate.description,
                difference: parseFloat(diff.toFixed(2)),
                status,
                message,
                monthly_volume: monthlyVolume,
                unit_price: unitPrice,
                monthly_impact: parseFloat(monthlyImpact.toFixed(2)),
                annual_impact: parseFloat((monthlyImpact * 12).toFixed(2)),
            });
        }

        res.json({
            products: results,
            summary: {
                total_products: products.length,
                mismatched: overpaying + underpaying,
                overpaying,
                underpaying,
                correct,
                monthly_impact: parseFloat(totalMonthlyImpact.toFixed(2)),
                annual_impact: parseFloat((totalMonthlyImpact * 12).toFixed(2)),
            },
        });
    } catch (err) {
        console.error("Overpay check error:", err);
        res.status(500).json({ error: "Overpay check failed" });
    }
});

// ══════════════════════════════════════════════════════════
//  2. Monthly ITC Reconciliation
// ══════════════════════════════════════════════════════════
router.get("/itc-reconciliation", async (req, res) => {
    try {
        const userId = req.user.id;
        const { from, to } = req.query;

        // Default to current month
        const now = new Date();
        const periodFrom = from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const periodTo = to || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

        // Get purchase invoices in period
        const purchaseInvoices = await Invoice.findAll({
            where: {
                user_id: userId,
                invoice_type: "purchase",
                invoice_date: {
                    [Op.gte]: periodFrom,
                    [Op.lte]: periodTo,
                },
            },
            order: [["invoice_date", "DESC"]],
        });

        // Get sale invoices for output tax
        const saleInvoices = await Invoice.findAll({
            where: {
                user_id: userId,
                invoice_type: "sale",
                invoice_date: {
                    [Op.gte]: periodFrom,
                    [Op.lte]: periodTo,
                },
            },
        });

        // Analyze each purchase invoice
        const invoiceAnalysis = [];
        let totalInputTax = 0;
        let eligibleITC = 0;
        let ineligibleITC = 0;
        let invoicesWithIssues = 0;

        const INELIGIBLE_KEYWORDS = [
            "motor vehicle", "food", "beverage", "outdoor catering",
            "beauty treatment", "health service", "cosmetic surgery",
            "club membership", "travel benefit", "personal consumption",
        ];

        for (const inv of purchaseInvoices) {
            const inputTax = (parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0) +
                (parseFloat(inv.igst) || 0) + (parseFloat(inv.cess) || 0);
            totalInputTax += inputTax;

            const issues = [];
            let isEligible = true;

            // Check for missing GSTIN
            if (!inv.seller_gstin) {
                issues.push("Missing supplier GSTIN — ITC may be denied");
            }

            // Check for blocked categories
            const items = inv.items_json || [];
            for (const item of items) {
                const desc = (item.description || "").toLowerCase();
                if (INELIGIBLE_KEYWORDS.some(k => desc.includes(k))) {
                    issues.push(`"${item.description}" blocked under Section 17(5)`);
                    isEligible = false;
                }
            }

            if (isEligible) {
                eligibleITC += inputTax;
            } else {
                ineligibleITC += inputTax;
            }

            if (issues.length > 0) invoicesWithIssues++;

            invoiceAnalysis.push({
                id: inv.id,
                invoice_number: inv.invoice_number,
                invoice_date: inv.invoice_date,
                seller_name: inv.seller_name,
                seller_gstin: inv.seller_gstin || "MISSING",
                subtotal: parseFloat(inv.subtotal) || 0,
                input_tax: parseFloat(inputTax.toFixed(2)),
                eligible: isEligible,
                issues,
                payment_status: inv.payment_status,
            });
        }

        // Output tax from sales
        const totalOutputTax = saleInvoices.reduce((sum, inv) => {
            return sum + (parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0) +
                (parseFloat(inv.igst) || 0) + (parseFloat(inv.cess) || 0);
        }, 0);

        const netLiability = Math.max(0, totalOutputTax - eligibleITC);
        const totalSales = saleInvoices.reduce((s, inv) => s + (parseFloat(inv.subtotal) || 0), 0);
        const totalPurchases = purchaseInvoices.reduce((s, inv) => s + (parseFloat(inv.subtotal) || 0), 0);

        res.json({
            period: { from: periodFrom, to: periodTo },
            summary: {
                total_purchase_invoices: purchaseInvoices.length,
                total_sale_invoices: saleInvoices.length,
                total_purchases: parseFloat(totalPurchases.toFixed(2)),
                total_sales: parseFloat(totalSales.toFixed(2)),
                total_input_tax: parseFloat(totalInputTax.toFixed(2)),
                total_output_tax: parseFloat(totalOutputTax.toFixed(2)),
                eligible_itc: parseFloat(eligibleITC.toFixed(2)),
                ineligible_itc: parseFloat(ineligibleITC.toFixed(2)),
                net_liability: parseFloat(netLiability.toFixed(2)),
                invoices_with_issues: invoicesWithIssues,
                potential_savings: parseFloat(eligibleITC.toFixed(2)),
            },
            invoices: invoiceAnalysis,
        });
    } catch (err) {
        console.error("ITC reconciliation error:", err);
        res.status(500).json({ error: "ITC reconciliation failed" });
    }
});

// ══════════════════════════════════════════════════════════
//  3. Rate Change Impact Analysis
// ══════════════════════════════════════════════════════════
router.post("/rate-impact", async (req, res) => {
    try {
        const {
            hsn_sac_code, old_rate, new_rate,
            monthly_volume = 0, unit_price = 0,
            desired_margin_percent = 0,
        } = req.body;

        if (old_rate === undefined || new_rate === undefined) {
            return res.status(400).json({ error: "old_rate and new_rate are required" });
        }

        const oldRate = parseFloat(old_rate);
        const newRate = parseFloat(new_rate);
        const volume = parseInt(monthly_volume) || 0;
        const price = parseFloat(unit_price) || 0;
        const rateDiff = newRate - oldRate;

        // Per-unit impact
        const oldTaxPerUnit = (price * oldRate) / 100;
        const newTaxPerUnit = (price * newRate) / 100;
        const taxDiffPerUnit = newTaxPerUnit - oldTaxPerUnit;

        const oldMRP = price + oldTaxPerUnit;
        const newMRP = price + newTaxPerUnit;

        // Monthly & annual impact
        const monthlyTaxImpact = taxDiffPerUnit * volume;
        const annualTaxImpact = monthlyTaxImpact * 12;

        // Suggested new selling price to maintain margin
        let suggestedPrice = price;
        if (desired_margin_percent > 0 && price > 0) {
            // If rate increased, adjust base price to keep same MRP
            suggestedPrice = oldMRP / (1 + newRate / 100);
        }

        // Look up HSN description if code provided
        let hsnDescription = null;
        if (hsn_sac_code) {
            const today = new Date().toISOString().split("T")[0];
            const rate = await GstRate.findOne({
                where: {
                    hsn_sac_code,
                    effective_from: { [Op.lte]: today },
                    [Op.or]: [{ effective_to: null }, { effective_to: { [Op.gte]: today } }],
                },
            });
            if (rate) hsnDescription = rate.description;
        }

        const direction = rateDiff > 0 ? "increase" : rateDiff < 0 ? "decrease" : "no_change";

        res.json({
            hsn_sac_code: hsn_sac_code || null,
            hsn_description: hsnDescription,
            rate_change: {
                old_rate: oldRate,
                new_rate: newRate,
                difference: parseFloat(rateDiff.toFixed(2)),
                direction,
            },
            per_unit: {
                base_price: price,
                old_tax: parseFloat(oldTaxPerUnit.toFixed(2)),
                new_tax: parseFloat(newTaxPerUnit.toFixed(2)),
                tax_difference: parseFloat(taxDiffPerUnit.toFixed(2)),
                old_mrp: parseFloat(oldMRP.toFixed(2)),
                new_mrp: parseFloat(newMRP.toFixed(2)),
                mrp_difference: parseFloat((newMRP - oldMRP).toFixed(2)),
            },
            volume_impact: {
                monthly_volume: volume,
                monthly_tax_impact: parseFloat(monthlyTaxImpact.toFixed(2)),
                annual_tax_impact: parseFloat(annualTaxImpact.toFixed(2)),
            },
            pricing_advice: {
                suggested_base_price: parseFloat(suggestedPrice.toFixed(2)),
                to_maintain_old_mrp: parseFloat((oldMRP / (1 + newRate / 100)).toFixed(2)),
                recommendation: direction === "increase"
                    ? `Rate increased by ${rateDiff}%. To maintain old MRP of ₹${oldMRP.toFixed(2)}, reduce base price to ₹${(oldMRP / (1 + newRate / 100)).toFixed(2)}. Or increase MRP to ₹${newMRP.toFixed(2)}.`
                    : direction === "decrease"
                        ? `Rate decreased by ${Math.abs(rateDiff)}%. You can reduce MRP by ₹${Math.abs(newMRP - oldMRP).toFixed(2)} or keep it and increase margins.`
                        : "No rate change.",
            },
        });
    } catch (err) {
        console.error("Rate impact error:", err);
        res.status(500).json({ error: "Rate impact analysis failed" });
    }
});

// ══════════════════════════════════════════════════════════
//  4. Annual GST Summary / Tax Savings Report
// ══════════════════════════════════════════════════════════
router.get("/annual-summary", async (req, res) => {
    try {
        const userId = req.user.id;
        const { financial_year } = req.query;

        // Parse FY (e.g., "2025-26" → Apr 2025 – Mar 2026)
        let fyStart, fyEnd;
        if (financial_year && financial_year.includes("-")) {
            const startYear = parseInt(financial_year.split("-")[0]);
            fyStart = `${startYear}-04-01`;
            fyEnd = `${startYear + 1}-03-31`;
        } else {
            // Default to current FY
            const now = new Date();
            const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
            fyStart = `${year}-04-01`;
            fyEnd = `${year + 1}-03-31`;
        }

        // Sale invoices
        const saleInvoices = await Invoice.findAll({
            where: {
                user_id: userId,
                invoice_type: "sale",
                invoice_date: { [Op.gte]: fyStart, [Op.lte]: fyEnd },
            },
        });

        // Purchase invoices
        const purchaseInvoices = await Invoice.findAll({
            where: {
                user_id: userId,
                invoice_type: "purchase",
                invoice_date: { [Op.gte]: fyStart, [Op.lte]: fyEnd },
            },
        });

        // Filing records
        const filings = await FilingRecord.findAll({
            where: { user_id: userId, financial_year: financial_year || undefined },
        });

        // Calculations
        const calculations = await Calculation.findAll({
            where: {
                user_id: userId,
                created_at: { [Op.gte]: fyStart, [Op.lte]: fyEnd },
            },
        });

        // Aggregate sales
        const totalSalesRevenue = saleInvoices.reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0);
        const totalOutputCGST = saleInvoices.reduce((s, i) => s + (parseFloat(i.cgst) || 0), 0);
        const totalOutputSGST = saleInvoices.reduce((s, i) => s + (parseFloat(i.sgst) || 0), 0);
        const totalOutputIGST = saleInvoices.reduce((s, i) => s + (parseFloat(i.igst) || 0), 0);
        const totalOutputCess = saleInvoices.reduce((s, i) => s + (parseFloat(i.cess) || 0), 0);
        const totalOutputTax = totalOutputCGST + totalOutputSGST + totalOutputIGST + totalOutputCess;

        // Aggregate purchases
        const totalPurchases = purchaseInvoices.reduce((s, i) => s + (parseFloat(i.subtotal) || 0), 0);
        const totalInputCGST = purchaseInvoices.reduce((s, i) => s + (parseFloat(i.cgst) || 0), 0);
        const totalInputSGST = purchaseInvoices.reduce((s, i) => s + (parseFloat(i.sgst) || 0), 0);
        const totalInputIGST = purchaseInvoices.reduce((s, i) => s + (parseFloat(i.igst) || 0), 0);
        const totalInputCess = purchaseInvoices.reduce((s, i) => s + (parseFloat(i.cess) || 0), 0);
        const totalInputTax = totalInputCGST + totalInputSGST + totalInputIGST + totalInputCess;

        const netTaxLiability = Math.max(0, totalOutputTax - totalInputTax);

        // Filing analysis
        const filedOnTime = filings.filter(f => f.status === "filed").length;
        const filedLate = filings.filter(f => f.status === "late").length;
        const pending = filings.filter(f => f.status === "pending" || f.status === "draft").length;
        const totalLateFees = filings.reduce((s, f) => s + (parseFloat(f.late_fee) || 0), 0);

        // Paid vs unpaid invoices
        const paidSales = saleInvoices.filter(i => i.payment_status === "paid").length;
        const unpaidSales = saleInvoices.filter(i => i.payment_status !== "paid").length;
        const outstandingAmount = saleInvoices
            .filter(i => i.payment_status !== "paid")
            .reduce((s, i) => s + ((parseFloat(i.total) || 0) - (parseFloat(i.amount_paid) || 0)), 0);

        // Month-by-month breakdown
        const monthlyBreakdown = {};
        for (const inv of saleInvoices) {
            const month = inv.invoice_date?.substring(0, 7) || "unknown";
            if (!monthlyBreakdown[month]) {
                monthlyBreakdown[month] = { sales: 0, output_tax: 0, purchases: 0, input_tax: 0 };
            }
            monthlyBreakdown[month].sales += parseFloat(inv.subtotal) || 0;
            monthlyBreakdown[month].output_tax += (parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0) +
                (parseFloat(inv.igst) || 0) + (parseFloat(inv.cess) || 0);
        }
        for (const inv of purchaseInvoices) {
            const month = inv.invoice_date?.substring(0, 7) || "unknown";
            if (!monthlyBreakdown[month]) {
                monthlyBreakdown[month] = { sales: 0, output_tax: 0, purchases: 0, input_tax: 0 };
            }
            monthlyBreakdown[month].purchases += parseFloat(inv.subtotal) || 0;
            monthlyBreakdown[month].input_tax += (parseFloat(inv.cgst) || 0) + (parseFloat(inv.sgst) || 0) +
                (parseFloat(inv.igst) || 0) + (parseFloat(inv.cess) || 0);
        }

        // Savings tips
        const tips = [];
        if (totalInputTax === 0 && totalOutputTax > 0) {
            tips.push({
                type: "warning",
                title: "No ITC Claimed",
                message: `You paid ₹${totalOutputTax.toLocaleString("en-IN")} in output tax but claimed ₹0 ITC. Record your purchase invoices to claim input tax credit.`,
                potential_savings: totalOutputTax * 0.3, // conservative estimate
            });
        }
        if (filedLate > 0) {
            tips.push({
                type: "danger",
                title: "Late Filing Penalties",
                message: `${filedLate} filing(s) were submitted late, costing ₹${totalLateFees.toLocaleString("en-IN")} in late fees. Set calendar reminders to file on time.`,
                potential_savings: totalLateFees,
            });
        }
        if (outstandingAmount > 0) {
            tips.push({
                type: "info",
                title: "Outstanding Receivables",
                message: `₹${outstandingAmount.toLocaleString("en-IN")} in unpaid invoices. Follow up to improve cash flow.`,
                potential_savings: 0,
            });
        }
        if (pending > 0) {
            tips.push({
                type: "warning",
                title: "Pending Filings",
                message: `${pending} filing(s) are still pending. File them before the deadline to avoid penalties.`,
                potential_savings: pending * 2500, // average potential penalty per filing
            });
        }
        if (totalSalesRevenue > 0 && purchaseInvoices.length === 0) {
            tips.push({
                type: "info",
                title: "Record Purchase Invoices",
                message: "You have sales but no purchase invoices recorded. Recording purchases helps claim ITC and reduce your net tax liability.",
                potential_savings: totalOutputTax * 0.2,
            });
        }

        const totalPotentialSavings = tips.reduce((s, t) => s + (t.potential_savings || 0), 0);

        res.json({
            financial_year: financial_year || `${fyStart.substring(0, 4)}-${fyEnd.substring(2, 4)}`,
            period: { from: fyStart, to: fyEnd },
            revenue: {
                total_sales: parseFloat(totalSalesRevenue.toFixed(2)),
                total_purchases: parseFloat(totalPurchases.toFixed(2)),
                sale_invoices: saleInvoices.length,
                purchase_invoices: purchaseInvoices.length,
                outstanding_receivables: parseFloat(outstandingAmount.toFixed(2)),
                paid_invoices: paidSales,
                unpaid_invoices: unpaidSales,
            },
            tax: {
                output_tax: {
                    cgst: parseFloat(totalOutputCGST.toFixed(2)),
                    sgst: parseFloat(totalOutputSGST.toFixed(2)),
                    igst: parseFloat(totalOutputIGST.toFixed(2)),
                    cess: parseFloat(totalOutputCess.toFixed(2)),
                    total: parseFloat(totalOutputTax.toFixed(2)),
                },
                input_tax: {
                    cgst: parseFloat(totalInputCGST.toFixed(2)),
                    sgst: parseFloat(totalInputSGST.toFixed(2)),
                    igst: parseFloat(totalInputIGST.toFixed(2)),
                    cess: parseFloat(totalInputCess.toFixed(2)),
                    total: parseFloat(totalInputTax.toFixed(2)),
                },
                net_liability: parseFloat(netTaxLiability.toFixed(2)),
                itc_utilized: parseFloat(Math.min(totalInputTax, totalOutputTax).toFixed(2)),
            },
            compliance: {
                total_filings: filings.length,
                filed_on_time: filedOnTime,
                filed_late: filedLate,
                pending,
                total_late_fees: parseFloat(totalLateFees.toFixed(2)),
                compliance_rate: filings.length > 0
                    ? parseFloat(((filedOnTime / filings.length) * 100).toFixed(1))
                    : 100,
            },
            calculations_count: calculations.length,
            monthly_breakdown: Object.entries(monthlyBreakdown)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([month, data]) => ({
                    month,
                    ...data,
                    net_liability: Math.max(0, data.output_tax - data.input_tax),
                })),
            savings: {
                tips,
                total_potential_savings: parseFloat(totalPotentialSavings.toFixed(2)),
            },
        });
    } catch (err) {
        console.error("Annual summary error:", err);
        res.status(500).json({ error: "Annual summary generation failed" });
    }
});

module.exports = router;
