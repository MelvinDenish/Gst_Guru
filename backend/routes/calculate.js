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

// ── Public: calculate GST ─────────────────────────────────
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
        } = req.body;

        if (!hsn_sac_code || !taxable_value) {
            return res.status(400).json({ error: "HSN/SAC code and taxable value are required" });
        }

        // Find active rate for this HSN
        const today = new Date().toISOString().split("T")[0];
        const rate = await GstRate.findOne({
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

        if (!rate) {
            return res.status(404).json({ error: `No active GST rate found for HSN/SAC: ${hsn_sac_code}` });
        }

        const ratePercent = parseFloat(rate.rate_percent);
        const cessPercent = parseFloat(rate.cess_percent) || 0;
        const baseAmount = parseFloat(taxable_value) * parseInt(quantity);

        // Determine intra-state vs inter-state
        const isInterState =
            place_of_supply &&
            place_of_consumption &&
            place_of_supply !== place_of_consumption;

        let cgst = 0, sgst = 0, igst = 0;

        if (isInterState) {
            // IGST = full rate
            igst = parseFloat(((baseAmount * ratePercent) / 100).toFixed(2));
        } else {
            // CGST + SGST = half rate each
            cgst = parseFloat(((baseAmount * (ratePercent / 2)) / 100).toFixed(2));
            sgst = parseFloat(((baseAmount * (ratePercent / 2)) / 100).toFixed(2));
        }

        const cess = parseFloat(((baseAmount * cessPercent) / 100).toFixed(2));
        const totalTax = cgst + sgst + igst + cess;
        const total = parseFloat((baseAmount + totalTax).toFixed(2));

        // Save calculation if user is logged in
        let savedCalc = null;
        const calcData = {
            user_id: req.user?.id || null,
            hsn_sac_code,
            product_description: product_description || rate.description,
            taxable_value: baseAmount,
            quantity,
            place_of_supply: place_of_supply || null,
            place_of_consumption: place_of_consumption || null,
            transaction_type,
            reverse_charge,
            cgst,
            sgst,
            igst,
            cess,
            total,
            rate_used: ratePercent,
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
                total_tax: totalTax,
                rate_description: rate.description,
                category: rate.Category?.name || null,
                is_inter_state: isInterState,
                supply_state: INDIAN_STATES[place_of_supply] || null,
                consumption_state: INDIAN_STATES[place_of_consumption] || null,
            },
        });
    } catch (err) {
        console.error("Calculation error:", err);
        res.status(500).json({ error: "Calculation failed" });
    }
});

// ── Get Indian states list ────────────────────────────────
router.get("/states", (_req, res) => {
    const states = Object.entries(INDIAN_STATES).map(([code, name]) => ({
        code,
        name,
    }));
    res.json({ states });
});

module.exports = router;
