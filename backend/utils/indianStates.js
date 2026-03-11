/**
 * Complete list of Indian States and Union Territories with GST state codes.
 * Used across InvoiceTracker, E-Way Bill, GSTIN validator, etc.
 */
const INDIAN_STATES = [
    { code: "01", name: "Jammu & Kashmir" },
    { code: "02", name: "Himachal Pradesh" },
    { code: "03", name: "Punjab" },
    { code: "04", name: "Chandigarh" },
    { code: "05", name: "Uttarakhand" },
    { code: "06", name: "Haryana" },
    { code: "07", name: "Delhi" },
    { code: "08", name: "Rajasthan" },
    { code: "09", name: "Uttar Pradesh" },
    { code: "10", name: "Bihar" },
    { code: "11", name: "Sikkim" },
    { code: "12", name: "Arunachal Pradesh" },
    { code: "13", name: "Nagaland" },
    { code: "14", name: "Manipur" },
    { code: "15", name: "Mizoram" },
    { code: "16", name: "Tripura" },
    { code: "17", name: "Meghalaya" },
    { code: "18", name: "Assam" },
    { code: "19", name: "West Bengal" },
    { code: "20", name: "Jharkhand" },
    { code: "21", name: "Odisha" },
    { code: "22", name: "Chhattisgarh" },
    { code: "23", name: "Madhya Pradesh" },
    { code: "24", name: "Gujarat" },
    { code: "25", name: "Daman & Diu" },
    { code: "26", name: "Dadra & Nagar Haveli" },
    { code: "27", name: "Maharashtra" },
    { code: "28", name: "Andhra Pradesh (Old)" },
    { code: "29", name: "Karnataka" },
    { code: "30", name: "Goa" },
    { code: "31", name: "Lakshadweep" },
    { code: "32", name: "Kerala" },
    { code: "33", name: "Tamil Nadu" },
    { code: "34", name: "Puducherry" },
    { code: "35", name: "Andaman & Nicobar" },
    { code: "36", name: "Telangana" },
    { code: "37", name: "Andhra Pradesh" },
    { code: "38", name: "Ladakh" },
    { code: "97", name: "Other Territory" },
];

/**
 * Dynamically generate financial year options.
 * Returns list like ["2023-24", "2024-25", "2025-26", "2026-27", "2027-28"]
 * centered around the current financial year.
 */
function getFinancialYears() {
    const now = new Date();
    const currentMonth = now.getMonth();  // 0-indexed  
    const currentYear = now.getFullYear();
    // FY starts in April: if month >= 3 (April), FY start = currentYear; else currentYear - 1
    const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
    const years = [];
    for (let i = -2; i <= 2; i++) {
        const y = fyStart + i;
        years.push(`${y}-${String(y + 1).slice(2)}`);
    }
    return years;
}

/**
 * Get current financial year string (e.g., "2025-26")
 */
function getCurrentFinancialYear() {
    const now = new Date();
    const fyStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return `${fyStart}-${String(fyStart + 1).slice(2)}`;
}

/**
 * Get current period string (e.g., "Mar 2026")
 */
function getCurrentPeriod() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

module.exports = { INDIAN_STATES, getFinancialYears, getCurrentFinancialYear, getCurrentPeriod };
