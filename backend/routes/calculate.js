const express = require("express");
const { Op } = require("sequelize");
const { GstRate, Calculation, Category } = require("../models");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Indian state codes for IGST determination
const INDIAN_STATES = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
    "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
    "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
    "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
    "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam",
    "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
    "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
    "26": "Dadra Nagar Haveli & Daman Diu", "27": "Maharashtra",
    "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa",
    "31": "Lakshadweep", "32": "Kerala", "33": "Tamil Nadu",
    "34": "Puducherry", "35": "Andaman & Nicobar", "36": "Telangana",
    "37": "Andhra Pradesh (New)", "38": "Ladakh",
};

// ── Helper: find active rate for an HSN code ─────────────
async function findActiveRate(hsn_sac_code) {
    const today = new Date().toISOString().split("T")[0];
    return GstRate.findOne({
        where: {
            hsn_sac_code,
            effective_from: { [Op.lte]: today },
            [Op.or]: [
                { effective_to: null },
                { effective_to: { [Op.gte]: today } },
            ],
        },
        include: [{ model: Category, attributes: ["id", "name"] }],
    });
}

// ── Helper: resolve effective rate (handles price slabs) ─
function resolveRate(rate, unitPrice) {
    const priceSlabs = rate.price_slabs_json;
    if (priceSlabs && Array.isArray(priceSlabs) && unitPrice > 0) {
        for (const slab of priceSlabs) {
            if (slab.max_value === null || unitPrice <= slab.max_value) {
                return parseFloat(slab.rate);
            }
        }
    }
    return parseFloat(rate.rate_percent);
}

// ── Helper: core tax calculation logic ───────────────────
function computeTax({ baseAmount, ratePercent, cessPercent, isInterState, isReverse }) {
    let cgst = 0, sgst = 0, igst = 0;

    if (isReverse) {
        // Under RCM, seller's invoice shows zero tax
        return { cgst: 0, sgst: 0, igst: 0, cess: 0, totalTax: 0, total: baseAmount };
    }

    if (isInterState) {
        igst = parseFloat(((baseAmount * ratePercent) / 100).toFixed(2));
    } else {
        cgst = parseFloat(((baseAmount * (ratePercent / 2)) / 100).toFixed(2));
        sgst = parseFloat(((baseAmount * (ratePercent / 2)) / 100).toFixed(2));
    }

    const cess = parseFloat(((baseAmount * cessPercent) / 100).toFixed(2));
    const totalTax = cgst + sgst + igst + cess;
    const total = parseFloat((baseAmount + totalTax).toFixed(2));

    return { cgst, sgst, igst, cess, totalTax, total };
}

// ── Public: calculate GST (single item) ──────────────────
router.post("/", optionalAuth, async (req, res) => {
    try {
        const {
            hsn_sac_code,
            product_description,
            taxable_value,
            quantity = 1,
            place_of_supply,
            place_of_consumption,
            transaction_type = "B2C",
            reverse_charge = false,
            calculation_mode = "forward",    // "forward" or "reverse"
            discount_percent = 0,
            discount_amount = 0,
            selected_variant_index = null,   // for automobile cess selection
        } = req.body;

        if (!hsn_sac_code || !taxable_value) {
            return res.status(400).json({ error: "HSN/SAC code and taxable value are required" });
        }

        const rate = await findActiveRate(hsn_sac_code);
        if (!rate) {
            return res.status(404).json({ error: `No active GST rate found for HSN/SAC: ${hsn_sac_code}` });
        }

        const qty = parseInt(quantity) || 1;
        const inputValue = parseFloat(taxable_value);

        // Determine effective rate (handles price slabs)
        const unitPrice = inputValue; // per-unit price for slab determination
        const effectiveRate = resolveRate(rate, unitPrice);

        // Determine cess — use variant if automobile spec selected
        let cessPercent = parseFloat(rate.cess_percent) || 0;
        const applicability = rate.applicability_json;
        if (applicability && applicability.type === "automobile" && selected_variant_index !== null) {
            const variant = applicability.variants[selected_variant_index];
            if (variant) cessPercent = parseFloat(variant.cess) || 0;
        }

        // Apply discount
        let rawBase = inputValue * qty;
        if (discount_percent > 0) {
            rawBase = rawBase - (rawBase * parseFloat(discount_percent) / 100);
        } else if (discount_amount > 0) {
            rawBase = rawBase - parseFloat(discount_amount);
        }
        rawBase = Math.max(0, parseFloat(rawBase.toFixed(2)));

        // Forward vs Reverse calculation mode
        let baseAmount;
        if (calculation_mode === "reverse") {
            // Input is MRP (tax-inclusive), derive base
            const totalRatePercent = effectiveRate + cessPercent;
            baseAmount = parseFloat((rawBase / (1 + totalRatePercent / 100)).toFixed(2));
        } else {
            baseAmount = rawBase;
        }

        const isInterState =
            place_of_supply &&
            place_of_consumption &&
            place_of_supply !== place_of_consumption;

        // Determine if RCM applies
        const rcmApplicable = rate.is_rcm || reverse_charge;

        const taxResult = computeTax({
            baseAmount,
            ratePercent: effectiveRate,
            cessPercent,
            isInterState,
            isReverse: rcmApplicable,
        });

        // Save calculation if user is logged in
        let savedCalc = null;
        const calcData = {
            user_id: req.user?.id || null,
            hsn_sac_code,
            product_description: product_description || rate.description,
            taxable_value: baseAmount,
            quantity: qty,
            place_of_supply: place_of_supply || null,
            place_of_consumption: place_of_consumption || null,
            transaction_type,
            reverse_charge: rcmApplicable,
            cgst: taxResult.cgst,
            sgst: taxResult.sgst,
            igst: taxResult.igst,
            cess: taxResult.cess,
            total: taxResult.total,
            rate_used: effectiveRate,
            rate_snapshot_id: rate.id,
        };

        if (req.user) {
            savedCalc = await Calculation.create(calcData);
        }

        res.json({
            calculation: {
                ...calcData,
                id: savedCalc?.id || null,
                base_amount: baseAmount,
                total_tax: taxResult.totalTax,
                rate_description: rate.description,
                category: rate.Category?.name || null,
                is_inter_state: isInterState,
                supply_state: INDIAN_STATES[place_of_supply] || null,
                consumption_state: INDIAN_STATES[place_of_consumption] || null,
                calculation_mode,
                original_input: inputValue * qty,
                discount_applied: parseFloat((inputValue * qty - rawBase).toFixed(2)),
                rcm_applicable: rcmApplicable,
                is_rcm_item: rate.is_rcm || false,
                price_slabs: rate.price_slabs_json || null,
                applicability: rate.applicability_json || null,
            },
        });
    } catch (err) {
        console.error("Calculation error:", err);
        res.status(500).json({ error: "Calculation failed" });
    }
});

// ── Bundle: composite / mixed supply ─────────────────────
router.post("/bundle", optionalAuth, async (req, res) => {
    try {
        const {
            items,             // [{ hsn_sac_code, taxable_value, quantity, description }]
            bundle_type,       // "composite" or "mixed"
            principal_index,   // index of principal item (for composite)
            place_of_supply,
            place_of_consumption,
            transaction_type = "B2C",
        } = req.body;

        if (!items || !Array.isArray(items) || items.length < 2) {
            return res.status(400).json({ error: "Bundle requires at least 2 items" });
        }
        if (!["composite", "mixed"].includes(bundle_type)) {
            return res.status(400).json({ error: "bundle_type must be 'composite' or 'mixed'" });
        }

        // Fetch rates for all items
        const itemsWithRates = [];
        for (const item of items) {
            const rate = await findActiveRate(item.hsn_sac_code);
            if (!rate) {
                return res.status(404).json({ error: `No rate found for HSN: ${item.hsn_sac_code}` });
            }
            const qty = parseInt(item.quantity) || 1;
            const value = parseFloat(item.taxable_value) * qty;
            itemsWithRates.push({
                ...item,
                rate,
                ratePercent: parseFloat(rate.rate_percent),
                cessPercent: parseFloat(rate.cess_percent) || 0,
                lineTotal: value,
                quantity: qty,
            });
        }

        const totalBundleValue = itemsWithRates.reduce((sum, i) => sum + i.lineTotal, 0);

        // Determine effective rate for the bundle
        let effectiveRate, effectiveCess, effectiveRateSource;

        if (bundle_type === "composite") {
            const idx = parseInt(principal_index);
            if (isNaN(idx) || idx < 0 || idx >= itemsWithRates.length) {
                return res.status(400).json({ error: "Invalid principal_index for composite bundle" });
            }
            effectiveRate = itemsWithRates[idx].ratePercent;
            effectiveCess = itemsWithRates[idx].cessPercent;
            effectiveRateSource = `Principal: ${itemsWithRates[idx].hsn_sac_code}`;
        } else {
            // Mixed: highest rate applies
            let maxIdx = 0;
            for (let i = 1; i < itemsWithRates.length; i++) {
                if (itemsWithRates[i].ratePercent > itemsWithRates[maxIdx].ratePercent) {
                    maxIdx = i;
                }
            }
            effectiveRate = itemsWithRates[maxIdx].ratePercent;
            effectiveCess = itemsWithRates[maxIdx].cessPercent;
            effectiveRateSource = `Highest: ${itemsWithRates[maxIdx].hsn_sac_code} (${effectiveRate}%)`;
        }

        const isInterState =
            place_of_supply &&
            place_of_consumption &&
            place_of_supply !== place_of_consumption;

        const taxResult = computeTax({
            baseAmount: totalBundleValue,
            ratePercent: effectiveRate,
            cessPercent: effectiveCess,
            isInterState,
            isReverse: false,
        });

        res.json({
            bundle: {
                bundle_type,
                items: itemsWithRates.map(i => ({
                    hsn_sac_code: i.hsn_sac_code,
                    description: i.description || i.rate.description,
                    quantity: i.quantity,
                    line_total: i.lineTotal,
                    individual_rate: i.ratePercent,
                })),
                effective_rate: effectiveRate,
                effective_cess: effectiveCess,
                effective_rate_source: effectiveRateSource,
                taxable_value: parseFloat(totalBundleValue.toFixed(2)),
                cgst: taxResult.cgst,
                sgst: taxResult.sgst,
                igst: taxResult.igst,
                cess: taxResult.cess,
                total_tax: taxResult.totalTax,
                total: taxResult.total,
                is_inter_state: isInterState,
                supply_state: INDIAN_STATES[place_of_supply] || null,
                consumption_state: INDIAN_STATES[place_of_consumption] || null,
                transaction_type,
            },
        });
    } catch (err) {
        console.error("Bundle calculation error:", err);
        res.status(500).json({ error: "Bundle calculation failed" });
    }
});

// ── Batch: multiple single-item calculations ─────────────
router.post("/batch", optionalAuth, async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Provide an array of items" });
        }
        if (items.length > 100) {
            return res.status(400).json({ error: "Maximum 100 items per batch" });
        }

        const results = [];
        for (const item of items) {
            const rate = await findActiveRate(item.hsn_sac_code);
            if (!rate) {
                results.push({ hsn_sac_code: item.hsn_sac_code, error: "Rate not found" });
                continue;
            }

            const qty = parseInt(item.quantity) || 1;
            const inputValue = parseFloat(item.taxable_value) || 0;
            const effectiveRate = resolveRate(rate, inputValue);
            const cessPercent = parseFloat(rate.cess_percent) || 0;
            const baseAmount = inputValue * qty;

            const isInterState = item.place_of_supply && item.place_of_consumption
                && item.place_of_supply !== item.place_of_consumption;

            const taxResult = computeTax({
                baseAmount,
                ratePercent: effectiveRate,
                cessPercent,
                isInterState,
                isReverse: rate.is_rcm || false,
            });

            results.push({
                hsn_sac_code: item.hsn_sac_code,
                description: rate.description,
                quantity: qty,
                taxable_value: baseAmount,
                rate_used: effectiveRate,
                ...taxResult,
                rcm_applicable: rate.is_rcm || false,
            });
        }

        res.json({ results, count: results.length });
    } catch (err) {
        console.error("Batch calculation error:", err);
        res.status(500).json({ error: "Batch calculation failed" });
    }
});

// ── Get Indian states list ───────────────────────────────
router.get("/states", (_req, res) => {
    const states = Object.entries(INDIAN_STATES).map(([code, name]) => ({
        code,
        name,
    }));
    res.json({ states });
});

module.exports = router;
