import { useState, useCallback } from "react";
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

export default function BundleCalculator() {
    const [bundleType, setBundleType] = useState("composite");
    const [items, setItems] = useState([]);
    const [principalIndex, setPrincipalIndex] = useState(0);
    const [supplyState, setSupplyState] = useState("27");
    const [consumptionState, setConsumptionState] = useState("27");
    const [txnType, setTxnType] = useState("B2C");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Add item form
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [addAmount, setAddAmount] = useState("");
    const [addQty, setAddQty] = useState(1);
    const [selectedForAdd, setSelectedForAdd] = useState(null);

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
                const { data } = await ratesAPI.search(params);
                setSearchResults(data.rates || []);
                setShowDropdown(true);
            } catch { setSearchResults([]); }
        }, 300),
        []
    );

    const handleSelectForAdd = (item) => {
        setSelectedForAdd(item);
        setSearchQuery(`${item.hsn_sac_code} — ${item.description}`);
        setShowDropdown(false);
    };

    const addItem = () => {
        if (!selectedForAdd || !addAmount) {
            setToast({ message: "Select an item and enter amount", type: "error" });
            return;
        }
        setItems([...items, {
            hsn_sac_code: selectedForAdd.hsn_sac_code,
            description: selectedForAdd.description,
            rate_percent: selectedForAdd.rate_percent,
            taxable_value: parseFloat(addAmount),
            quantity: parseInt(addQty) || 1,
        }]);
        setSearchQuery("");
        setSelectedForAdd(null);
        setAddAmount("");
        setAddQty(1);
        setResult(null);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        if (principalIndex >= newItems.length) setPrincipalIndex(Math.max(0, newItems.length - 1));
        setResult(null);
    };

    const handleCalculate = async () => {
        if (items.length < 2) {
            setToast({ message: "Add at least 2 items to create a bundle", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const { data } = await calculateAPI.bundle({
                items: items.map(i => ({
                    hsn_sac_code: i.hsn_sac_code,
                    taxable_value: i.taxable_value,
                    quantity: i.quantity,
                    description: i.description,
                })),
                bundle_type: bundleType,
                principal_index: bundleType === "composite" ? principalIndex : undefined,
                place_of_supply: supplyState,
                place_of_consumption: consumptionState,
                transaction_type: txnType,
            });
            setResult(data.bundle);
            setToast({ message: "Bundle GST calculated!", type: "success" });
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Calculation failed", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const isInterState = supplyState !== consumptionState;
    const bundleTotal = items.reduce((sum, i) => sum + (i.taxable_value * i.quantity), 0);

    return (
        <div className="page bundle-page">
            <div className="page-header">
                <h1>📦 Bundle Calculator</h1>
                <p className="subtitle">Calculate GST for Composite & Mixed Supply bundles</p>
            </div>

            {/* Bundle Type Toggle */}
            <div className="bundle-type-section glass-card">
                <div className="bundle-type-toggle">
                    <button
                        className={`bundle-type-btn ${bundleType === "composite" ? "active" : ""}`}
                        onClick={() => { setBundleType("composite"); setResult(null); }}
                    >
                        <span className="bundle-icon">🔗</span>
                        <span className="bundle-label">Composite Supply</span>
                        <span className="bundle-hint">Naturally bundled — Principal item's rate applies</span>
                    </button>
                    <button
                        className={`bundle-type-btn ${bundleType === "mixed" ? "active" : ""}`}
                        onClick={() => { setBundleType("mixed"); setResult(null); }}
                    >
                        <span className="bundle-icon">🎁</span>
                        <span className="bundle-label">Mixed Supply</span>
                        <span className="bundle-hint">Artificially bundled — Highest rate applies</span>
                    </button>
                </div>
            </div>

            <div className="bundle-layout">
                {/* Add Item Panel */}
                <div className="bundle-add glass-card">
                    <h3>Add Items to Bundle</h3>
                    <div className="form-group search-group">
                        <label>Search Product / HSN</label>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                className="input search-input"
                                placeholder="e.g., Laptop, 8471..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setSelectedForAdd(null); searchRates(e.target.value); }}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                            />
                            {showDropdown && searchResults.length > 0 && (
                                <div className="search-dropdown">
                                    {searchResults.slice(0, 8).map((item) => (
                                        <button key={item.id} className="dropdown-item" onClick={() => handleSelectForAdd(item)}>
                                            <span className="item-hsn">{item.hsn_sac_code}</span>
                                            <span className="item-desc">{item.description}</span>
                                            <span className={`item-rate slab-${item.rate_percent}`}>{item.rate_percent}%</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="add-item-row">
                        <div className="form-group">
                            <label>Unit Price (₹)</label>
                            <input type="number" className="input" placeholder="10,000" value={addAmount}
                                onChange={(e) => setAddAmount(e.target.value)} min="0" />
                        </div>
                        <div className="form-group">
                            <label>Qty</label>
                            <input type="number" className="input" value={addQty}
                                onChange={(e) => setAddQty(e.target.value)} min="1" />
                        </div>
                        <button className="btn btn-primary btn-add" onClick={addItem} disabled={!selectedForAdd || !addAmount}>
                            + Add
                        </button>
                    </div>

                    {/* Location & Type */}
                    <div className="bundle-options">
                        <div className="form-group">
                            <label>Place of Supply</label>
                            <select className="input" value={supplyState} onChange={(e) => { setSupplyState(e.target.value); setResult(null); }}>
                                {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Place of Consumption</label>
                            <select className="input" value={consumptionState} onChange={(e) => { setConsumptionState(e.target.value); setResult(null); }}>
                                {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <span className={`interstate-badge ${isInterState ? "inter" : "intra"}`}>
                        {isInterState ? "⇄ Inter-State (IGST)" : "⇌ Intra-State (CGST+SGST)"}
                    </span>
                </div>

                {/* Items List */}
                <div className="bundle-items glass-card">
                    <h3>Bundle Items ({items.length})</h3>
                    {items.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📦</span>
                            <p>Add at least 2 items to calculate bundle GST</p>
                        </div>
                    ) : (
                        <>
                            <div className="bundle-items-list">
                                {items.map((item, i) => (
                                    <div key={i} className={`bundle-item-card ${bundleType === "composite" && principalIndex === i ? "principal" : ""}`}>
                                        <div className="bundle-item-top">
                                            <span className="code-badge">{item.hsn_sac_code}</span>
                                            <span className={`slab-badge slab-badge-${item.rate_percent}`}>{item.rate_percent}%</span>
                                            <button className="btn-icon delete" onClick={() => removeItem(i)} title="Remove">✕</button>
                                        </div>
                                        <p className="bundle-item-desc">{item.description?.split("—")[0]}</p>
                                        <div className="bundle-item-bottom">
                                            <span>₹{(item.taxable_value * item.quantity).toLocaleString("en-IN")} (×{item.quantity})</span>
                                            {bundleType === "composite" && (
                                                <label className="principal-radio">
                                                    <input type="radio" name="principal" checked={principalIndex === i}
                                                        onChange={() => { setPrincipalIndex(i); setResult(null); }} />
                                                    Principal
                                                </label>
                                            )}
                                        </div>
                                        {bundleType === "composite" && principalIndex === i && (
                                            <div className="principal-badge">★ Principal Supply</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="bundle-summary">
                                <span>Bundle Value: <strong>₹{bundleTotal.toLocaleString("en-IN")}</strong></span>
                                <span>Items: <strong>{items.length}</strong></span>
                                <span>Rule: <strong>{bundleType === "composite" ? `Principal Rate (${items[principalIndex]?.rate_percent}%)` : `Highest Rate`}</strong></span>
                            </div>

                            <button className="btn btn-primary btn-calculate" onClick={handleCalculate}
                                disabled={items.length < 2 || loading}>
                                {loading ? <span className="spinner"></span> : "Calculate Bundle GST"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Bundle Result */}
            {result && (
                <div className="result-card glass-card animate-slide-up">
                    <h2 className="section-title">📊 Bundle Tax Breakdown</h2>

                    <div className="bundle-result-info">
                        <span className="bundle-result-type">{result.bundle_type === "composite" ? "🔗 Composite Supply" : "🎁 Mixed Supply"}</span>
                        <span className="bundle-result-source">{result.effective_rate_source}</span>
                    </div>

                    <div className="bundle-result-items">
                        {result.items.map((item, i) => (
                            <div key={i} className="bundle-result-item">
                                <span className="code-badge">{item.hsn_sac_code}</span>
                                <span>{item.description?.split("—")[0]}</span>
                                <span className="individual-rate">Individual: {item.individual_rate}%</span>
                                <span>₹{Number(item.line_total).toLocaleString("en-IN")}</span>
                            </div>
                        ))}
                    </div>

                    <div className="breakdown-grid">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Total Bundle Value</span>
                            <span className="breakdown-value">₹{Number(result.taxable_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Effective Rate Applied</span>
                            <span className="breakdown-value">{result.effective_rate}%</span>
                        </div>
                        {result.is_inter_state ? (
                            <div className="breakdown-item highlight-igst">
                                <span className="breakdown-label">IGST ({result.effective_rate}%)</span>
                                <span className="breakdown-value">₹{Number(result.igst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                            </div>
                        ) : (
                            <>
                                <div className="breakdown-item highlight-cgst">
                                    <span className="breakdown-label">CGST ({result.effective_rate / 2}%)</span>
                                    <span className="breakdown-value">₹{Number(result.cgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="breakdown-item highlight-sgst">
                                    <span className="breakdown-label">SGST ({result.effective_rate / 2}%)</span>
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
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
