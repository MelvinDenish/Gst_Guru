import { useState, useEffect } from "react";
import { aiLookupAPI } from "../api";
import Toast from "../components/Toast";

export default function GstLookup() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [recentSearches, setRecentSearches] = useState([]);
    const [activeTab, setActiveTab] = useState("lookup"); // lookup, gstin, eway

    // GSTIN validator state
    const [gstin, setGstin] = useState("");
    const [gstinResult, setGstinResult] = useState(null);

    // E-Way bill state
    const [ewayForm, setEwayForm] = useState({
        invoice_number: "", supplier_gstin: "", recipient_gstin: "",
        place_of_supply: "27", place_of_delivery: "33",
        transport_mode: "Road", vehicle_number: "", distance_km: "100",
        items: [{ description: "", hsn_code: "", price: "", quantity: "1", gst_rate: "18" }],
    });
    const [ewayResult, setEwayResult] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem("gst_recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const { data } = await aiLookupAPI.search(query);
            setResult(data);
            // Save to recent
            const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
            setRecentSearches(updated);
            localStorage.setItem("gst_recent_searches", JSON.stringify(updated));
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Lookup failed", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleValidateGSTIN = async () => {
        if (!gstin.trim()) return;
        try {
            const { data } = await aiLookupAPI.validateGSTIN(gstin);
            setGstinResult(data);
        } catch (err) {
            setToast({ message: "Validation failed", type: "error" });
        }
    };

    const addEwayItem = () => {
        setEwayForm(f => ({
            ...f,
            items: [...f.items, { description: "", hsn_code: "", price: "", quantity: "1", gst_rate: "18" }],
        }));
    };

    const updateEwayItem = (idx, field, value) => {
        setEwayForm(f => {
            const items = [...f.items];
            items[idx] = { ...items[idx], [field]: value };
            return { ...f, items };
        });
    };

    const removeEwayItem = (idx) => {
        setEwayForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };

    const handleGenerateEway = async () => {
        try {
            const { data } = await aiLookupAPI.ewayBill(ewayForm);
            setEwayResult(data.eway_bill);
        } catch (err) {
            setToast({ message: err.response?.data?.error || "E-Way bill generation failed", type: "error" });
        }
    };

    return (
        <div className="page gst-lookup-page">
            <div className="page-header">
                <h1>🤖 <span className="gradient-text">GST Intelligence Hub</span></h1>
                <p className="subtitle">AI-powered GST lookup, GSTIN validator & E-Way bill generator</p>
            </div>

            {/* Tab Navigation */}
            <div className="lookup-tabs">
                <button className={`tab-btn ${activeTab === "lookup" ? "active" : ""}`}
                    onClick={() => setActiveTab("lookup")}>🔍 AI GST Lookup</button>
                <button className={`tab-btn ${activeTab === "gstin" ? "active" : ""}`}
                    onClick={() => setActiveTab("gstin")}>✅ GSTIN Validator</button>
                <button className={`tab-btn ${activeTab === "eway" ? "active" : ""}`}
                    onClick={() => setActiveTab("eway")}>🚛 E-Way Bill</button>
            </div>

            {/* ─── AI GST Lookup Tab ──────────────────────────── */}
            {activeTab === "lookup" && (
                <div className="lookup-section">
                    <div className="lookup-card glass-card">
                        <h2>🧠 AI-Powered GST Rate Finder</h2>
                        <p className="lookup-hint">Search any product, brand, or service — e.g. "Samsung Galaxy S24", "Nike running shoes", "Paracetamol 500mg"</p>
                        <div className="lookup-input-row">
                            <input
                                type="text"
                                className="input lookup-input"
                                placeholder="Enter product name, brand, or description..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <button className="btn btn-primary" onClick={handleSearch} disabled={loading || !query.trim()}>
                                {loading ? <span className="spinner"></span> : "Search"}
                            </button>
                        </div>

                        {/* Recent Searches */}
                        {recentSearches.length > 0 && !result && (
                            <div className="recent-searches">
                                <span className="recent-label">Recent:</span>
                                {recentSearches.map((s, i) => (
                                    <button key={i} className="recent-tag" onClick={() => { setQuery(s); }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Loading Animation */}
                    {loading && (
                        <div className="ai-thinking glass-card">
                            <div className="thinking-dots">
                                <span></span><span></span><span></span>
                            </div>
                            <p>AI is analyzing GST data...</p>
                        </div>
                    )}

                    {/* AI Result */}
                    {result && !loading && (
                        <div className="lookup-results animate-slide-up">
                            {result.ai_result && (
                                <div className="ai-result-card glass-card">
                                    <div className="ai-result-header">
                                        <div className="ai-badge">🤖 AI Result</div>
                                        <span className="ai-model">{result.ai_model}</span>
                                    </div>
                                    <div className="ai-result-body">
                                        <div className="result-main-info">
                                            <h3>{result.ai_result.product_name}</h3>
                                            {result.ai_result.brand && (
                                                <span className="brand-badge">🏷️ {result.ai_result.brand}</span>
                                            )}
                                        </div>

                                        <div className="gst-rate-display">
                                            <div className="rate-big">
                                                <span className="rate-number">{result.ai_result.gst_rate}%</span>
                                                <span className="rate-label">GST Rate</span>
                                            </div>
                                            {result.ai_result.cess_rate > 0 && (
                                                <div className="cess-display">
                                                    <span className="cess-number">+{result.ai_result.cess_rate}%</span>
                                                    <span className="rate-label">Cess</span>
                                                </div>
                                            )}
                                            <div className="hsn-display">
                                                <span className="hsn-code">{result.ai_result.hsn_sac_code}</span>
                                                <span className="rate-label">HSN/SAC</span>
                                            </div>
                                        </div>

                                        <div className="result-details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Category</span>
                                                <span className="detail-value">{result.ai_result.category}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Effective From</span>
                                                <span className="detail-value">{result.ai_result.effective_from}</span>
                                            </div>
                                            {result.ai_result.rcm_applicable && (
                                                <div className="detail-item rcm-flag">
                                                    <span className="detail-label">RCM</span>
                                                    <span className="detail-value">⚠️ Applicable</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="result-description">
                                            <strong>📋 Details:</strong>
                                            <p>{result.ai_result.description}</p>
                                        </div>

                                        {result.ai_result.brand_specific_notes && (
                                            <div className="brand-notes">
                                                <strong>🏷️ Brand-Specific Notes:</strong>
                                                <p>{result.ai_result.brand_specific_notes}</p>
                                            </div>
                                        )}

                                        {result.ai_result.exemptions && (
                                            <div className="exemptions-info">
                                                <strong>🎯 Exemptions/Conditions:</strong>
                                                <p>{result.ai_result.exemptions}</p>
                                            </div>
                                        )}

                                        {result.ai_result.related_items && result.ai_result.related_items.length > 0 && (
                                            <div className="related-items">
                                                <strong>🔗 Related Items:</strong>
                                                <ul>
                                                    {result.ai_result.related_items.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {result.ai_error && (
                                <div className="ai-error glass-card">
                                    <p>⚠️ AI lookup unavailable: {result.ai_error}</p>
                                    <p className="error-hint">Set GROQ_API_KEY in backend .env for AI-powered results</p>
                                </div>
                            )}

                            {/* Local DB Matches */}
                            {result.local_matches && result.local_matches.length > 0 && (
                                <div className="local-matches glass-card">
                                    <h3>📦 Database Matches</h3>
                                    <div className="matches-grid">
                                        {result.local_matches.map((m) => (
                                            <div key={m.id} className="match-card">
                                                <div className="match-hsn">
                                                    <span className="code-badge">{m.hsn_sac_code}</span>
                                                    <span className={`slab-badge slab-badge-${m.rate_percent}`}>{m.rate_percent}%</span>
                                                </div>
                                                <p className="match-desc">{m.description}</p>
                                                {m.category && <span className="category-tag">{m.category}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ─── GSTIN Validator Tab ────────────────────────── */}
            {activeTab === "gstin" && (
                <div className="gstin-section">
                    <div className="gstin-card glass-card">
                        <h2>✅ GSTIN Validator</h2>
                        <p className="lookup-hint">Enter a 15-character GSTIN to validate its format and checksum</p>
                        <div className="lookup-input-row">
                            <input
                                type="text"
                                className="input lookup-input"
                                placeholder="e.g., 27AADCB2230M1Z3"
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                maxLength={15}
                                onKeyDown={(e) => e.key === "Enter" && handleValidateGSTIN()}
                            />
                            <button className="btn btn-primary" onClick={handleValidateGSTIN} disabled={!gstin.trim()}>
                                Validate
                            </button>
                        </div>

                        {gstinResult && (
                            <div className={`gstin-result animate-slide-up ${gstinResult.valid ? "valid" : "invalid"}`}>
                                <div className="gstin-status">
                                    <span className={`status-icon ${gstinResult.valid ? "success" : "error"}`}>
                                        {gstinResult.valid ? "✅" : "❌"}
                                    </span>
                                    <span className="status-text">
                                        {gstinResult.valid ? "Valid GSTIN" : "Invalid GSTIN"}
                                    </span>
                                </div>
                                {gstinResult.error && (
                                    <p className="gstin-error">{gstinResult.error}</p>
                                )}
                                {gstinResult.details && (
                                    <div className="gstin-details">
                                        <div className="detail-item">
                                            <span className="detail-label">State</span>
                                            <span className="detail-value">{gstinResult.details.state_name} ({gstinResult.details.state_code})</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">PAN</span>
                                            <span className="detail-value">{gstinResult.details.pan}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Entity Number</span>
                                            <span className="detail-value">{gstinResult.details.entity_number}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Checksum</span>
                                            <span className="detail-value">{gstinResult.details.checksum_valid ? "✅ Verified" : "❌ Failed"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── E-Way Bill Tab ──────────────────────────────── */}
            {activeTab === "eway" && (
                <div className="eway-section">
                    <div className="eway-card glass-card">
                        <h2>🚛 E-Way Bill Generator</h2>
                        <p className="lookup-hint">Generate E-Way bill information for goods transportation</p>

                        <div className="eway-form">
                            <div className="calc-grid">
                                <div className="form-group">
                                    <label>Invoice Number</label>
                                    <input type="text" className="input" placeholder="INV-001"
                                        value={ewayForm.invoice_number}
                                        onChange={e => setEwayForm(f => ({ ...f, invoice_number: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Supplier GSTIN</label>
                                    <input type="text" className="input" placeholder="27AADCB2230M1Z3"
                                        value={ewayForm.supplier_gstin}
                                        onChange={e => setEwayForm(f => ({ ...f, supplier_gstin: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Recipient GSTIN</label>
                                    <input type="text" className="input" placeholder="33AADCB2230M1Z3"
                                        value={ewayForm.recipient_gstin}
                                        onChange={e => setEwayForm(f => ({ ...f, recipient_gstin: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Distance (km)</label>
                                    <input type="number" className="input" value={ewayForm.distance_km}
                                        onChange={e => setEwayForm(f => ({ ...f, distance_km: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Transport Mode</label>
                                    <select className="input" value={ewayForm.transport_mode}
                                        onChange={e => setEwayForm(f => ({ ...f, transport_mode: e.target.value }))}>
                                        <option>Road</option><option>Rail</option>
                                        <option>Air</option><option>Ship</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vehicle Number</label>
                                    <input type="text" className="input" placeholder="MH01AB1234"
                                        value={ewayForm.vehicle_number}
                                        onChange={e => setEwayForm(f => ({ ...f, vehicle_number: e.target.value }))} />
                                </div>
                            </div>

                            <h3 style={{ marginTop: "1.5rem" }}>Items</h3>
                            {ewayForm.items.map((item, idx) => (
                                <div key={idx} className="eway-item-row">
                                    <input type="text" className="input" placeholder="Description"
                                        value={item.description} onChange={e => updateEwayItem(idx, "description", e.target.value)} />
                                    <input type="text" className="input" placeholder="HSN" style={{ width: "100px" }}
                                        value={item.hsn_code} onChange={e => updateEwayItem(idx, "hsn_code", e.target.value)} />
                                    <input type="number" className="input" placeholder="Price" style={{ width: "120px" }}
                                        value={item.price} onChange={e => updateEwayItem(idx, "price", e.target.value)} />
                                    <input type="number" className="input" placeholder="Qty" style={{ width: "80px" }}
                                        value={item.quantity} onChange={e => updateEwayItem(idx, "quantity", e.target.value)} />
                                    <input type="number" className="input" placeholder="GST%" style={{ width: "80px" }}
                                        value={item.gst_rate} onChange={e => updateEwayItem(idx, "gst_rate", e.target.value)} />
                                    {ewayForm.items.length > 1 && (
                                        <button className="btn-icon delete" onClick={() => removeEwayItem(idx)}>🗑️</button>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-secondary" onClick={addEwayItem} style={{ marginTop: "0.5rem" }}>+ Add Item</button>

                            <button className="btn btn-primary btn-calculate" onClick={handleGenerateEway}
                                style={{ marginTop: "1.5rem" }}>Generate E-Way Bill</button>
                        </div>

                        {ewayResult && (
                            <div className="eway-result animate-slide-up">
                                <div className="eway-result-header">
                                    <h3>🚛 E-Way Bill Information</h3>
                                    <span className="code-badge">{ewayResult.reference_number}</span>
                                </div>

                                <div className={`eway-mandatory ${ewayResult.eway_required ? "required" : "optional"}`}>
                                    {ewayResult.threshold_note}
                                </div>

                                <div className="result-details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Supply Type</span>
                                        <span className="detail-value">{ewayResult.supply_type}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Total Value</span>
                                        <span className="detail-value">₹{Number(ewayResult.total_value).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Total Tax</span>
                                        <span className="detail-value">₹{Number(ewayResult.total_tax).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Grand Total</span>
                                        <span className="detail-value total-cell">₹{Number(ewayResult.grand_total).toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Distance</span>
                                        <span className="detail-value">{ewayResult.transport.distance_km} km</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Validity</span>
                                        <span className="detail-value">{ewayResult.validity.days} day(s)</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
