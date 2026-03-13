const express = require("express");
const { Op } = require("sequelize");
const { GstRate, Category } = require("../models");
const { lookupGST, getApiKey } = require("../services/aiGstLookup");

const router = express.Router();

// ── AI-powered GST lookup ────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ error: "Please enter a product name, brand, or description" });
        }

        // First, try local DB search
        const localResults = await GstRate.findAll({
            where: {
                description: { [Op.like]: `%${query}%` },
            },
            include: [{ model: Category, attributes: ["id", "name"] }],
            limit: 5,
        });

        // Then call AI for comprehensive info
        const aiResult = await lookupGST(query);

        res.json({
            query,
            ai_result: aiResult.success ? aiResult.data : null,
            ai_model: aiResult.model || null,
            ai_error: aiResult.success ? null : aiResult.error,
            local_matches: localResults.map(r => ({
                id: r.id,
                hsn_sac_code: r.hsn_sac_code,
                description: r.description,
                rate_percent: r.rate_percent,
                cess_percent: r.cess_percent,
                category: r.Category?.name || null,
                is_rcm: r.is_rcm,
            })),
            source: aiResult.success ? "ai+local" : "local_only",
        });
    } catch (err) {
        console.error("AI Lookup error:", err);
        res.status(500).json({ error: "Lookup failed" });
    }
});

// ── GSTIN Validator ──────────────────────────────────────
router.post("/validate-gstin", (req, res) => {
    try {
        const { gstin } = req.body;

        if (!gstin || gstin.length !== 15) {
            return res.json({
                valid: false,
                error: "GSTIN must be exactly 15 characters",
            });
        }

        // GSTIN format: SSPPPPPPPPPPXZC
        // SS = State code (01-38)
        // PPPPPPPPPP = PAN (10 chars)
        // X = Entity number (1-Z)
        // Z = Default 'Z'
        // C = Check digit

        const gstinRegex = /^([0-9]{2})([A-Z]{5}[0-9]{4}[A-Z])([0-9A-Z])([Z])([0-9A-Z])$/;
        const match = gstin.match(gstinRegex);

        if (!match) {
            return res.json({
                valid: false,
                error: "Invalid GSTIN format",
                format: "Expected: 2-digit state code + 10-char PAN + entity number + Z + check digit",
            });
        }

        const stateCode = match[1];
        const pan = match[2];
        const entityNum = match[3];
        const checkDigit = match[5];

        // State code validation
        const STATES = {
            "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
            "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
            "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
            "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
            "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
            "16": "Tripura", "17": "Meghalaya", "18": "Assam",
            "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
            "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
            "26": "Dadra Nagar Haveli", "27": "Maharashtra", "28": "Andhra Pradesh",
            "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
            "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry",
            "35": "Andaman & Nicobar", "36": "Telangana", "37": "Andhra Pradesh (New)",
            "38": "Ladakh",
        };

        if (!STATES[stateCode]) {
            return res.json({
                valid: false,
                error: `Invalid state code: ${stateCode}`,
            });
        }

        // Checksum validation (Luhn-like for GSTIN)
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let sum = 0;
        for (let i = 0; i < 14; i++) {
            const idx = chars.indexOf(gstin[i]);
            let val = idx;
            if (i % 2 !== 0) {
                val = Math.floor(idx * 2 / 36) + (idx * 2 % 36);
            }
            sum += val;
        }
        const remainder = sum % 36;
        const computed = chars[(36 - remainder) % 36];

        const checksumValid = computed === checkDigit;

        res.json({
            valid: checksumValid,
            details: {
                state_code: stateCode,
                state_name: STATES[stateCode],
                pan,
                entity_number: entityNum,
                check_digit: checkDigit,
                checksum_valid: checksumValid,
            },
            ...(checksumValid ? {} : {
                error: "Checksum verification failed — GSTIN may be incorrect",
            }),
        });
    } catch (err) {
        console.error("GSTIN validation error:", err);
        res.status(500).json({ error: "Validation failed" });
    }
});

// ── E-Way Bill Info Generator ────────────────────────────
router.post("/eway-bill", (req, res) => {
    try {
        const {
            invoice_number, invoice_date, supplier_gstin, recipient_gstin,
            place_of_supply, place_of_delivery, items, transport_mode,
            vehicle_number, transporter_id, distance_km,
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "At least one item required" });
        }

        // Calculate totals
        let totalValue = 0, totalTax = 0;
        const isInterState = place_of_supply && place_of_delivery && place_of_supply !== place_of_delivery;

        const processedItems = items.map((item, idx) => {
            const value = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
            const rate = parseFloat(item.gst_rate) || 18;
            const tax = (value * rate) / 100;
            totalValue += value;
            totalTax += tax;
            return {
                sr: idx + 1,
                hsn_code: item.hsn_code || "—",
                description: item.description || "Item",
                quantity: parseInt(item.quantity) || 1,
                unit: item.unit || "NOS",
                value: parseFloat(value.toFixed(2)),
                gst_rate: rate,
                tax_amount: parseFloat(tax.toFixed(2)),
            };
        });

        // E-Way bill required if value > ₹50,000
        const ewayRequired = (totalValue + totalTax) > 50000;

        // Generate reference number
        const refNo = `EWB-${Date.now().toString(36).toUpperCase()}`;

        // Validity based on distance
        const dist = parseInt(distance_km) || 100;
        let validDays = 1;
        if (dist > 100 && dist <= 300) validDays = 3;
        else if (dist > 300 && dist <= 500) validDays = 5;
        else if (dist > 500 && dist <= 1000) validDays = 10;
        else if (dist > 1000) validDays = 15;

        const validFrom = new Date().toISOString();
        const validTo = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toISOString();

        res.json({
            eway_bill: {
                reference_number: refNo,
                eway_required: ewayRequired,
                threshold_note: ewayRequired
                    ? "E-Way bill is mandatory (value > ₹50,000)"
                    : "E-Way bill is optional (value ≤ ₹50,000)",
                invoice_number: invoice_number || "—",
                invoice_date: invoice_date || new Date().toISOString().split("T")[0],
                supply_type: isInterState ? "Inter-State" : "Intra-State",
                supplier_gstin: supplier_gstin || "—",
                recipient_gstin: recipient_gstin || "—",
                items: processedItems,
                total_value: parseFloat(totalValue.toFixed(2)),
                total_tax: parseFloat(totalTax.toFixed(2)),
                grand_total: parseFloat((totalValue + totalTax).toFixed(2)),
                transport: {
                    mode: transport_mode || "Road",
                    vehicle_number: vehicle_number || "—",
                    transporter_id: transporter_id || "—",
                    distance_km: dist,
                },
                validity: {
                    valid_from: validFrom,
                    valid_to: validTo,
                    days: validDays,
                },
            },
        });
    } catch (err) {
        console.error("E-Way bill error:", err);
        res.status(500).json({ error: "Failed to generate E-Way bill info" });
    }
});

// ── AI Invoice Analyzer ─────────────────────────────────
router.post("/analyze-invoice", async (req, res) => {
    try {
        const { invoice_text } = req.body;
        if (!invoice_text || invoice_text.trim().length < 10) {
            return res.status(400).json({ error: "Please provide invoice text to analyze" });
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            return res.json({ success: false, error: "GROQ_API_KEY not configured", fallback: true });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: `You are an expert invoice analyzer. Extract all details from the given invoice text and return JSON:
{
  "invoice_number": "string",
  "invoice_date": "YYYY-MM-DD or null",
  "seller": { "name": "string", "gstin": "string or null", "address": "string or null" },
  "buyer": { "name": "string", "gstin": "string or null", "address": "string or null" },
  "items": [{ "description": "string", "hsn_code": "string or null", "quantity": number, "unit_price": number, "gst_rate": number, "amount": number }],
  "subtotal": number, "cgst": number, "sgst": number, "igst": number, "cess": number, "total": number,
  "supply_type": "intra-state or inter-state",
  "place_of_supply": "state name or null",
  "warnings": ["any discrepancies or issues found"],
  "summary": "brief summary of the invoice"
}
If any field cannot be determined, use null or 0 as appropriate.` },
                    { role: "user", content: `Analyze this invoice:\n\n${invoice_text}` },
                ],
                temperature: 0.1, max_tokens: 2048,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            return res.json({ success: false, error: `AI error: ${response.status}` });
        }

        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
        res.json({ success: true, analysis: parsed, model: data.model });
    } catch (err) {
        console.error("Invoice analyzer error:", err);
        res.status(500).json({ error: "Analysis failed" });
    }
});

// ── AI Penalty & Interest Calculator ────────────────────
router.post("/penalty-calc", (req, res) => {
    try {
        const { return_type, due_date, filing_date, tax_liability } = req.body;

        if (!due_date || !filing_date) {
            return res.status(400).json({ error: "Due date and filing date required" });
        }

        const due = new Date(due_date);
        const filed = new Date(filing_date);
        const daysLate = Math.max(0, Math.ceil((filed - due) / (1000 * 60 * 60 * 24)));
        const liability = parseFloat(tax_liability) || 0;

        // Late fee under Section 47 of CGST Act
        let lateFeePerDay = 0;
        let maxLateFee = 0;

        if (return_type === "GSTR-3B" || return_type === "GSTR-1") {
            lateFeePerDay = liability > 0 ? 50 : 20; // ₹50/day (₹25 CGST + ₹25 SGST) if tax due, else ₹20
            maxLateFee = 5000; // ₹5000 per return (₹2500 CGST + ₹2500 SGST)
        } else if (return_type === "GSTR-9") {
            lateFeePerDay = 200; // ₹200/day (₹100 CGST + ₹100 SGST)
            maxLateFee = liability > 0 ? liability * 0.25 : 15000; // 0.25% of turnover or max ₹based
        } else {
            lateFeePerDay = 50;
            maxLateFee = 5000;
        }

        const totalLateFee = Math.min(daysLate * lateFeePerDay, maxLateFee);

        // Interest under Section 50 — 18% per annum on tax liability
        const interestRate = 0.18;
        const interest = parseFloat(((liability * interestRate * daysLate) / 365).toFixed(2));

        // Penalty scenarios
        const penalties = [];
        if (daysLate > 0) {
            penalties.push({
                section: "Section 47 - Late Fee",
                description: `₹${lateFeePerDay}/day for ${daysLate} days (capped at ₹${maxLateFee})`,
                amount: totalLateFee,
            });
        }
        if (liability > 0 && daysLate > 0) {
            penalties.push({
                section: "Section 50 - Interest",
                description: `18% p.a. on ₹${liability.toLocaleString("en-IN")} for ${daysLate} days`,
                amount: interest,
            });
        }
        if (daysLate > 90) {
            penalties.push({
                section: "Section 122 - General Penalty",
                description: "Additional penalty may apply for persistent non-compliance (>90 days)",
                amount: Math.max(10000, liability * 0.10),
                note: "Subject to officer discretion",
            });
        }

        const totalPenalty = penalties.reduce((s, p) => s + p.amount, 0);

        res.json({
            return_type: return_type || "GSTR-3B",
            due_date, filing_date,
            days_late: daysLate,
            tax_liability: liability,
            penalties,
            total_penalty: parseFloat(totalPenalty.toFixed(2)),
            total_payable: parseFloat((liability + totalPenalty).toFixed(2)),
            tips: daysLate === 0
                ? ["✅ Filed on time! No penalties."]
                : [
                    "File ASAP to stop daily late fee accumulation",
                    "Interest is calculated from the day after due date",
                    "Consider voluntary payment before notice to avoid higher penalties",
                    daysLate > 30 ? "⚠️ Returns filed >30 days late may attract scrutiny" : null,
                ].filter(Boolean),
        });
    } catch (err) {
        console.error("Penalty calc error:", err);
        res.status(500).json({ error: "Calculation failed" });
    }
});

// ── Multi-Brand AI Comparison ───────────────────────────
router.post("/compare", async (req, res) => {
    try {
        const { products } = req.body;
        if (!products || !Array.isArray(products) || products.length < 2) {
            return res.status(400).json({ error: "At least 2 products required for comparison" });
        }

        if (products.length > 5) {
            return res.status(400).json({ error: "Maximum 5 products can be compared at once" });
        }

        const apiKey = getApiKey();
        if (!apiKey) {
            return res.json({ success: false, error: "GROQ_API_KEY not configured" });
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: `Compare GST rates for multiple products/brands. Return JSON:
{
  "comparisons": [
    { "product": "name", "brand": "brand or null", "hsn_code": "code", "gst_rate": number, "cess_rate": number, "effective_rate": number, "category": "cat", "notes": "any brand-specific notes" }
  ],
  "lowest_rate_product": "product with lowest GST",
  "highest_rate_product": "product with highest GST",
  "summary": "comparison summary with key differences",
  "savings_tip": "tip on how to save on GST if applicable"
}` },
                    { role: "user", content: `Compare GST rates for: ${products.join(", ")}` },
                ],
                temperature: 0.1, max_tokens: 2048,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            return res.json({ success: false, error: `AI error: ${response.status}` });
        }

        const data = await response.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
        res.json({ success: true, comparison: parsed, model: data.model });
    } catch (err) {
        console.error("Compare error:", err);
        res.status(500).json({ error: "Comparison failed" });
    }
});

module.exports = router;
