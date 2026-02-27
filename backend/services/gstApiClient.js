/**
 * Third-Party GST API Client
 * 
 * Adapter-pattern client that supports multiple GST API providers.
 * Configure via environment variables:
 *   GST_API_PROVIDER = "fastgst" | "mastersindia" | "cleartax"
 *   GST_API_KEY = your API key
 *   GST_API_BASE_URL = custom base URL (optional)
 * 
 * If no API key is configured, methods return empty results gracefully.
 */

const GST_API_PROVIDER = process.env.GST_API_PROVIDER || "fastgst";
const GST_API_KEY = process.env.GST_API_KEY || "";
const GST_API_BASE_URL = process.env.GST_API_BASE_URL || "";

// Provider configurations
const PROVIDERS = {
    fastgst: {
        baseUrl: "https://api.fastgst.in/v1",
        ratesEndpoint: "/rates",
        hsnEndpoint: "/hsn",
        authHeader: "X-API-Key",
    },
    mastersindia: {
        baseUrl: "https://commonapi.mastersindia.co",
        ratesEndpoint: "/tax-rates",
        hsnEndpoint: "/hsn-search",
        authHeader: "Authorization",
        authPrefix: "Bearer ",
    },
    cleartax: {
        baseUrl: "https://api.cleartax.in/gst",
        ratesEndpoint: "/rates",
        hsnEndpoint: "/hsn",
        authHeader: "X-Cleartax-Auth",
    },
};

/**
 * Check if a third-party API is configured
 */
function isConfigured() {
    return Boolean(GST_API_KEY);
}

/**
 * Get the provider config
 */
function getProvider() {
    const config = PROVIDERS[GST_API_PROVIDER] || PROVIDERS.fastgst;
    if (GST_API_BASE_URL) config.baseUrl = GST_API_BASE_URL;
    return config;
}

/**
 * Fetch all current GST rates from the third-party API
 * @returns {Promise<{rates: Array, error: string|null}>}
 */
async function fetchRates() {
    const result = { rates: [], error: null };

    if (!isConfigured()) {
        result.error = "No GST API key configured (set GST_API_KEY env var)";
        console.log("[GST API] Skipping — no API key configured");
        return result;
    }

    const provider = getProvider();

    try {
        const headers = { "Content-Type": "application/json" };
        if (provider.authPrefix) {
            headers[provider.authHeader] = `${provider.authPrefix}${GST_API_KEY}`;
        } else {
            headers[provider.authHeader] = GST_API_KEY;
        }

        const response = await fetch(`${provider.baseUrl}${provider.ratesEndpoint}`, {
            headers,
            signal: AbortSignal.timeout(20000),
        });

        if (!response.ok) {
            result.error = `API returned HTTP ${response.status}`;
            return result;
        }

        const data = await response.json();

        // Normalize response — different providers have different formats
        const rawRates = data.rates || data.data || data.results || [];

        for (const item of rawRates) {
            const hsn = item.hsn_sac_code || item.hsn || item.hsn_code || item.code || "";
            const desc = item.description || item.desc || item.name || "";
            const rate = parseFloat(item.rate_percent || item.rate || item.gst_rate || item.tax_rate || 0);
            const cess = parseFloat(item.cess_percent || item.cess || item.cess_rate || 0);

            if (hsn && !isNaN(rate)) {
                result.rates.push({
                    hsn_sac_code: String(hsn),
                    description: desc.substring(0, 200),
                    rate_percent: rate,
                    cess_percent: cess,
                    source: "api",
                });
            }
        }

        console.log(`[GST API] Fetched ${result.rates.length} rates from ${GST_API_PROVIDER}`);
    } catch (err) {
        result.error = `GST API error: ${err.message}`;
        console.error("[GST API]", err.message);
    }

    return result;
}

/**
 * Lookup a specific HSN code rate
 * @param {string} hsn
 * @returns {Promise<{rate: object|null, error: string|null}>}
 */
async function lookupHSN(hsn) {
    if (!isConfigured()) return { rate: null, error: "No API key configured" };

    const provider = getProvider();

    try {
        const headers = { "Content-Type": "application/json" };
        headers[provider.authHeader] = provider.authPrefix
            ? `${provider.authPrefix}${GST_API_KEY}`
            : GST_API_KEY;

        const response = await fetch(`${provider.baseUrl}${provider.hsnEndpoint}/${hsn}`, {
            headers,
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) return { rate: null, error: `HTTP ${response.status}` };

        const data = await response.json();
        return { rate: data, error: null };
    } catch (err) {
        return { rate: null, error: err.message };
    }
}

module.exports = { isConfigured, fetchRates, lookupHSN };
