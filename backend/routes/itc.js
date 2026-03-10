const express = require("express");
const { lookupGST } = require("../services/aiGstLookup");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// ── ITC Calculation ──────────────────────────────────────
router.post("/calculate", (req, res) => {
    try {
        const { purchases } = req.body;

        if (!purchases || !Array.isArray(purchases) || purchases.length === 0) {
            return res.status(400).json({ error: "At least one purchase entry required" });
        }

        let totalPurchaseValue = 0;
        let totalCGST = 0, totalSGST = 0, totalIGST = 0, totalCess = 0;
        let eligibleITC = 0, ineligibleITC = 0;

        // Ineligible categories per Section 17(5) of CGST Act
        const INELIGIBLE_CATEGORIES = [
            "motor vehicle", "food", "beverage", "outdoor catering",
            "beauty treatment", "health service", "cosmetic surgery",
            "club membership", "travel benefit", "works contract",
            "construction of immovable property", "personal consumption",
        ];

        const processed = purchases.map((p, idx) => {
            const value = parseFloat(p.value) || 0;
            const rate = parseFloat(p.gst_rate) || 18;
            const isInterState = p.is_interstate || false;
            const category = (p.category || "").toLowerCase();

            const taxAmount = (value * rate) / 100;
            let cgst = 0, sgst = 0, igst = 0, cess = 0;

            if (isInterState) {
                igst = taxAmount;
            } else {
                cgst = taxAmount / 2;
                sgst = taxAmount / 2;
            }

            const cessRate = parseFloat(p.cess_rate) || 0;
            cess = (value * cessRate) / 100;

            const totalTax = cgst + sgst + igst + cess;

            // Check eligibility
            const isIneligible = INELIGIBLE_CATEGORIES.some(cat => category.includes(cat));
            const eligibilityPercent = p.business_use_percent ? Math.min(100, Math.max(0, parseFloat(p.business_use_percent))) : 100;

            let claimableITC = 0;
            if (isIneligible) {
                claimableITC = 0;
            } else {
                claimableITC = (totalTax * eligibilityPercent) / 100;
            }

            totalPurchaseValue += value;
            totalCGST += cgst;
            totalSGST += sgst;
            totalIGST += igst;
            totalCess += cess;
            eligibleITC += claimableITC;
            ineligibleITC += (totalTax - claimableITC);

            return {
                sr: idx + 1,
                description: p.description || `Purchase ${idx + 1}`,
                supplier_gstin: p.supplier_gstin || "—",
                invoice_number: p.invoice_number || "—",
                value: parseFloat(value.toFixed(2)),
                gst_rate: rate,
                cgst: parseFloat(cgst.toFixed(2)),
                sgst: parseFloat(sgst.toFixed(2)),
                igst: parseFloat(igst.toFixed(2)),
                cess: parseFloat(cess.toFixed(2)),
                total_tax: parseFloat(totalTax.toFixed(2)),
                eligible: !isIneligible,
                business_use_percent: eligibilityPercent,
                claimable_itc: parseFloat(claimableITC.toFixed(2)),
                reason: isIneligible ? "Blocked under Section 17(5) CGST Act" : null,
            };
        });

        // ITC Utilization order (IGST → CGST → SGST)
        const utilization = {
            igst_against_igst: Math.min(totalIGST, eligibleITC),
            remaining_after_igst: Math.max(0, eligibleITC - totalIGST),
        };

        res.json({
            summary: {
                total_purchase_value: parseFloat(totalPurchaseValue.toFixed(2)),
                total_cgst: parseFloat(totalCGST.toFixed(2)),
                total_sgst: parseFloat(totalSGST.toFixed(2)),
                total_igst: parseFloat(totalIGST.toFixed(2)),
                total_cess: parseFloat(totalCess.toFixed(2)),
                total_tax_paid: parseFloat((totalCGST + totalSGST + totalIGST + totalCess).toFixed(2)),
                eligible_itc: parseFloat(eligibleITC.toFixed(2)),
                ineligible_itc: parseFloat(ineligibleITC.toFixed(2)),
                net_itc_claimable: parseFloat(eligibleITC.toFixed(2)),
            },
            utilization,
            purchases: processed,
        });
    } catch (err) {
        console.error("ITC calculation error:", err);
        res.status(500).json({ error: "ITC calculation failed" });
    }
});

// ── AI Tax Advisory ──────────────────────────────────────
router.post("/ai-advice", async (req, res) => {
    try {
        const { scenario } = req.body;
        if (!scenario) {
            return res.status(400).json({ error: "Tax scenario description required" });
        }

        const result = await lookupGST(
            `Tax advisory: ${scenario}. Include ITC eligibility, applicable sections, and compliance tips.`
        );

        res.json({
            query: scenario,
            advice: result.success ? result.data : null,
            error: result.success ? null : result.error,
            model: result.model || null,
        });
    } catch (err) {
        console.error("AI advice error:", err);
        res.status(500).json({ error: "Advisory failed" });
    }
});

module.exports = router;
