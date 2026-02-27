import { useState, useEffect, useCallback } from "react";
import { ratesAPI, calculateAPI } from "../api";
import Toast from "../components/Toast";

const INDIAN_STATES = [
    { code: "01", name: "Jammu & Kashmir" }, { code: "02", name: "Himachal Pradesh" },
    { code: "03", name: "Punjab" }, { code: "04", name: "Chandigarh" },
    { code: "05", name: "Uttarakhand" }, { code: "06", name: "Haryana" },
    { code: "07", name: "Delhi" }, { code: "08", name: "Rajasthan" },
    { code: "09", name: "Uttar Pradesh" }, { code: "10", name: "Bihar" },
    { code: "11", name: "Sikkim" }, { code: "12", name: "Arunachal Pradesh" },
    { code: "13", name: "Nagaland" }, { code: "14", name: "Manipur" },
    { code: "15", name: "Mizoram" }, { code: "16", name: "Tripura" },
    { code: "17", name: "Meghalaya" }, { code: "18", name: "Assam" },
    { code: "19", name: "West Bengal" }, { code: "20", name: "Jharkhand" },
    { code: "21", name: "Odisha" }, { code: "22", name: "Chhattisgarh" },
    { code: "23", name: "Madhya Pradesh" }, { code: "24", name: "Gujarat" },
    { code: "26", name: "Dadra Nagar Haveli" }, { code: "27", name: "Maharashtra" },
    { code: "28", name: "Andhra Pradesh" }, { code: "29", name: "Karnataka" },
    { code: "30", name: "Goa" }, { code: "31", name: "Lakshadweep" },
    { code: "32", name: "Kerala" }, { code: "33", name: "Tamil Nadu" },
    { code: "34", name: "Puducherry" }, { code: "35", name: "Andaman & Nicobar" },
    { code: "36", name: "Telangana" }, { code: "37", name: "Andhra Pradesh (New)" },
    { code: "38", name: "Ladakh" },
];

export default function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [amount, setAmount] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [supplyState, setSupplyState] = useState("27");
    const [consumptionState, setConsumptionState] = useState("27");
    const [txnType, setTxnType] = useState("B2C");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [slabFilter, setSlabFilter] = useState("");

    const debounce = (fn, ms) => {
        let t;
        return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    };

    const searchRates = useCallback(
        debounce(async (q) => {
            if (!q || q.length < 1) { setSearchResults([]); return; }
            try {
                const params = {};
                if (/^\d/.test(q)) params.hsn = q;
                else params.q = q;
                if (categoryFilter) params.category = categoryFilter;
                if (slabFilter !== "") params.slab = slabFilter;
                const { data } = await ratesAPI.search(params);
                setSearchResults(data.rates || []);
                setShowDropdown(true);
            } catch { setSearchResults([]); }
        }, 300),
        [categoryFilter, slabFilter]
    );

    useEffect(() => { searchRates(searchQuery); }, [searchQuery, searchRates]);

    const handleSelect = (item) => {
        setSelectedItem(item);
        setSearchQuery(`${item.hsn_sac_code} — ${item.description}`);
        setShowDropdown(false);
    };

    const handleCalculate = async () => {
        if (!selectedItem || !amount) {
            setToast({ message: "Select an item and enter amount", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const { data } = await calculateAPI.compute({
                hsn_sac_code: selectedItem.hsn_sac_code,
                product_description: selectedItem.description,
                taxable_value: parseFloat(amount),
                quantity: parseInt(quantity),
                place_of_supply: supplyState,
                place_of_consumption: consumptionState,
                transaction_type: txnType,
            });
            setResult(data.calculation);
            setToast({ message: "GST calculated successfully!", type: "success" });
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Calculation failed", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const isInterState = supplyState !== consumptionState;

    return (
        <div className="page home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Dynamic <span className="gradient-text">GST Calculator</span>
                    </h1>
                    <p className="hero-subtitle">
                        Compute CGST, SGST & IGST instantly with real-time rates from the latest government notifications.
                        200+ HSN/SAC codes, all slabs covered.
                    </p>
                </div>
                <div className="hero-stats">
                    <div className="stat-card">
                        <span className="stat-value">200+</span>
                        <span className="stat-label">HSN/SAC Codes</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">5</span>
                        <span className="stat-label">GST Slabs</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">10</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>
            </section>

            {/* Calculator Section */}
            <section className="calculator-section">
                <div className="calc-card glass-card">
                    <h2 className="section-title">🧮 GST Calculator</h2>

                    {/* Search */}
                    <div className="form-group search-group">
                        <label>Search HSN/SAC Code or Product</label>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                className="input search-input"
                                placeholder="Type HSN code (e.g., 8517) or product name (e.g., Mobile Phones)..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setSelectedItem(null); setResult(null); }}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                            />
                            {showDropdown && searchResults.length > 0 && (
                                <div className="search-dropdown">
                                    {searchResults.map((item) => (
                                        <button
                                            key={item.id}
                                            className="dropdown-item"
                                            onClick={() => handleSelect(item)}
                                        >
                                            <span className="item-hsn">{item.hsn_sac_code}</span>
                                            <span className="item-desc">{item.description}</span>
                                            <span className={`item-rate slab-${item.rate_percent}`}>{item.rate_percent}%</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filter-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="">All Categories</option>
                                {["Food & Essentials", "Textiles & Apparel", "Electronics & Appliances", "Healthcare & Pharma",
                                    "Automobiles & Parts", "Luxury & Lifestyle", "Services", "Construction & Materials",
                                    "Agriculture & Farming", "Stationery & Education"].map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>GST Slab</label>
                            <select className="input" value={slabFilter} onChange={(e) => setSlabFilter(e.target.value)}>
                                <option value="">All Slabs</option>
                                <option value="0">0%</option>
                                <option value="0.25">0.25%</option>
                                <option value="3">3%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>
                    </div>

                    {/* Selected item display */}
                    {selectedItem && (
                        <div className="selected-item glass-card-inner">
                            <div className="selected-header">
                                <span className="selected-hsn">{selectedItem.hsn_sac_code}</span>
                                <span className={`rate-badge slab-badge-${selectedItem.rate_percent}`}>
                                    GST {selectedItem.rate_percent}%
                                </span>
                            </div>
                            <p className="selected-desc">{selectedItem.description}</p>
                            {selectedItem.Category && (
                                <span className="category-tag">{selectedItem.Category.name}</span>
                            )}
                        </div>
                    )}

                    {/* Amount & Details */}
                    <div className="calc-grid">
                        <div className="form-group">
                            <label>Taxable Amount (₹)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="10,000"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setResult(null); }}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                className="input"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Place of Supply</label>
                            <select className="input" value={supplyState} onChange={(e) => { setSupplyState(e.target.value); setResult(null); }}>
                                {INDIAN_STATES.map((s) => (
                                    <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Place of Consumption</label>
                            <select className="input" value={consumptionState} onChange={(e) => { setConsumptionState(e.target.value); setResult(null); }}>
                                {INDIAN_STATES.map((s) => (
                                    <option key={s.code} value={s.code}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="txn-toggle">
                        <label>Transaction Type:</label>
                        <div className="toggle-group">
                            <button className={`toggle-btn ${txnType === "B2C" ? "active" : ""}`} onClick={() => setTxnType("B2C")}>B2C</button>
                            <button className={`toggle-btn ${txnType === "B2B" ? "active" : ""}`} onClick={() => setTxnType("B2B")}>B2B</button>
                        </div>
                        <span className={`interstate-badge ${isInterState ? "inter" : "intra"}`}>
                            {isInterState ? "⇄ Inter-State (IGST)" : "⇌ Intra-State (CGST+SGST)"}
                        </span>
                    </div>

                    <button
                        className="btn btn-primary btn-calculate"
                        onClick={handleCalculate}
                        disabled={!selectedItem || !amount || loading}
                    >
                        {loading ? <span className="spinner"></span> : "Calculate GST"}
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="result-card glass-card animate-slide-up">
                        <h2 className="section-title">📊 Tax Breakdown</h2>

                        <div className="result-header">
                            <span>{result.hsn_sac_code} — {result.product_description}</span>
                            <span className="rate-badge">GST {result.rate_used}%</span>
                        </div>

                        <div className="breakdown-grid">
                            <div className="breakdown-item">
                                <span className="breakdown-label">Base Amount</span>
                                <span className="breakdown-value">₹{Number(result.base_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>

                            {result.is_inter_state ? (
                                <div className="breakdown-item highlight-igst">
                                    <span className="breakdown-label">IGST ({result.rate_used}%)</span>
                                    <span className="breakdown-value">₹{Number(result.igst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                            ) : (
                                <>
                                    <div className="breakdown-item highlight-cgst">
                                        <span className="breakdown-label">CGST ({result.rate_used / 2}%)</span>
                                        <span className="breakdown-value">₹{Number(result.cgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="breakdown-item highlight-sgst">
                                        <span className="breakdown-label">SGST ({result.rate_used / 2}%)</span>
                                        <span className="breakdown-value">₹{Number(result.sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </>
                            )}

                            {parseFloat(result.cess) > 0 && (
                                <div className="breakdown-item highlight-cess">
                                    <span className="breakdown-label">Cess</span>
                                    <span className="breakdown-value">₹{Number(result.cess).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <div className="breakdown-item total">
                                <span className="breakdown-label">Total Tax</span>
                                <span className="breakdown-value">₹{Number(result.total_tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="breakdown-item grand-total">
                                <span className="breakdown-label">Grand Total (incl. GST)</span>
                                <span className="breakdown-value">₹{Number(result.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="result-meta">
                            <span>Supply: {result.supply_state || "—"}</span>
                            <span>Consumption: {result.consumption_state || "—"}</span>
                            <span>Type: {result.transaction_type}</span>
                        </div>
                    </div>
                )}
            </section>

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
