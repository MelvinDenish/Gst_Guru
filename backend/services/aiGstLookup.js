/**
 * AI GST Lookup Service — Uses Groq's free Llama API
 * Looks up GST rates, HSN codes, and brand-specific variations
 * using natural language queries.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Groq free API key — set in environment or use default demo key
function getApiKey() {
    return process.env.GROQ_API_KEY || "";
}

const SYSTEM_PROMPT = `You are an expert Indian GST (Goods and Services Tax) advisor. When asked about any product, brand, or service, provide accurate GST information.

IMPORTANT: Always respond in valid JSON format with this exact structure:
{
  "product_name": "clear product name",
  "brand": "brand name if mentioned, else null",
  "hsn_sac_code": "applicable HSN/SAC code (4-8 digits)",
  "gst_rate": number (0, 5, 12, 18, or 28),
  "cess_rate": number (0 if no cess),
  "category": "product category",
  "description": "brief description of why this rate applies",
  "brand_specific_notes": "any brand-specific GST variations or notes, null if none",
  "effective_from": "date if known, else 'Current'",
  "exemptions": "any exemptions or special conditions, null if none",
  "rcm_applicable": false,
  "price_dependent": false,
  "price_slabs": null,
  "related_items": ["list of related products with different rates if relevant"]
}

Key GST rules:
- 0%: Essential food items (unbranded), fresh produce, milk, education
- 5%: Packaged food, economy footwear (< ₹1000), mass transport, branded items under thresholds
- 12%: Processed food, standard clothing (₹1000+), cell phones, business class air travel
- 18%: Most manufactured goods, IT services, financial services, restaurants (with ITC)
- 28%: Luxury items, cars, tobacco, aerated drinks, cement, gambling

For branded items: Some products have different rates when branded vs unbranded (e.g., branded rice/flour is 5% while unbranded is 0%).
For automobiles: Cess varies by engine capacity, length, fuel type.

Always provide the most current, accurate information.`;

async function lookupGST(query) {
    const apiKey = getApiKey();

    if (!apiKey) {
        return {
            success: false,
            error: "GROQ_API_KEY not configured. Set it in your .env file.",
            fallback: true,
        };
    }

    try {
        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: `What is the GST rate for: ${query}` },
                ],
                temperature: 0.1,
                max_tokens: 1024,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Groq API error:", response.status, errText);
            return {
                success: false,
                error: `Groq API error: ${response.status}`,
                fallback: true,
            };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return { success: false, error: "Empty response from AI", fallback: true };
        }

        const parsed = JSON.parse(content);
        return {
            success: true,
            data: parsed,
            model: data.model || "llama-3.3-70b-versatile",
            usage: data.usage || null,
        };
    } catch (err) {
        console.error("AI GST Lookup error:", err);
        return {
            success: false,
            error: err.message,
            fallback: true,
        };
    }
}

module.exports = { lookupGST, getApiKey };
