import { useState } from "react";
import { itcAPI } from "../api";

const EMPTY_PURCHASE = {
    description: "", supplier_gstin: "", invoice_number: "",
    value: "", gst_rate: "18", cess_rate: "0", is_interstate: false,
    category: "", business_use_percent: "100",
};

export default function ItcCalculator() {
    const [purchases, setPurchases] = useState([{ ...EMPTY_PURCHASE }]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [adviceQuery, setAdviceQuery] = useState("");
    const [advice, setAdvice] = useState(null);
    const [adviceLoading, setAdviceLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("calculator");

    const updatePurchase = (idx, field, val) => {
        setPurchases(p => p.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };

    const addPurchase = () => setPurchases(p => [...p, { ...EMPTY_PURCHASE }]);
    const removePurchase = (idx) => setPurchases(p => p.filter((_, i) => i !== idx));

    const calculate = async () => {
        setLoading(true);
        try {
            const res = await itcAPI.calculate(purchases);
            setResult(res.data);
        } catch (err) {
            alert(err.response?.data?.error || "Calculation failed");
        }
        setLoading(false);
    };

    const getAdvice = async () => {
        if (!adviceQuery.trim()) return;
        setAdviceLoading(true);
        try {
            const res = await itcAPI.aiAdvice(adviceQuery);
            setAdvice(res.data);
        } catch {
            setAdvice({ error: "Failed to get advice" });
        }
        setAdviceLoading(false);
    };

    const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>📊 <span className="gradient-text">ITC Calculator</span></h1>
                    <p className="subtitle">Input Tax Credit calculator with Section 17(5) eligibility checks</p>
                </div>
            </div>

            <div className="lookup-tabs">
                <button className={`tab-btn ${activeTab === "calculator" ? "active" : ""}`} onClick={() => setActiveTab("calculator")}>🧮 ITC Calculator</button>
                <button className={`tab-btn ${activeTab === "advisory" ? "active" : ""}`} onClick={() => setActiveTab("advisory")}>🤖 AI Tax Advisory</button>
            </div>

            {activeTab === "calculator" && (
                <>
                    {/* Purchase Entries */}
                    <div className="glass-card" style={{ marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3>Purchase Entries</h3>
                            <button className="btn btn-secondary btn-sm" onClick={addPurchase}>+ Add Purchase</button>
                        </div>

                        {purchases.map((p, idx) => (
                            <div key={idx} className="glass-card-inner" style={{ marginBottom: "1rem", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Purchase #{idx + 1}</span>
                                    {purchases.length > 1 && (
                                        <button className="btn-icon delete" onClick={() => removePurchase(idx)} style={{ color: "#ef4444" }}>🗑️</button>
                                    )}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Description</label>
                                        <input className="input" placeholder="Item description" value={p.description} onChange={e => updatePurchase(idx, "description", e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Invoice Value (₹)</label>
                                        <input className="input" type="number" placeholder="10000" value={p.value} onChange={e => updatePurchase(idx, "value", e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>GST Rate (%)</label>
                                        <select className="input" value={p.gst_rate} onChange={e => updatePurchase(idx, "gst_rate", e.target.value)}>
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Cess Rate (%)</label>
                                        <input className="input" type="number" placeholder="0" value={p.cess_rate} onChange={e => updatePurchase(idx, "cess_rate", e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Category</label>
                                        <select className="input" value={p.category} onChange={e => updatePurchase(idx, "category", e.target.value)}>
                                            <option value="">General / Eligible</option>
                                            <option value="motor vehicle">Motor Vehicle</option>
                                            <option value="food">Food & Beverages</option>
                                            <option value="outdoor catering">Outdoor Catering</option>
                                            <option value="beauty treatment">Beauty / Health</option>
                                            <option value="club membership">Club Membership</option>
                                            <option value="travel benefit">Travel Benefits</option>
                                            <option value="construction of immovable property">Construction (Immovable)</option>
                                            <option value="personal consumption">Personal Consumption</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Business Use (%)</label>
                                        <input className="input" type="number" min="0" max="100" value={p.business_use_percent} onChange={e => updatePurchase(idx, "business_use_percent", e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Supplier GSTIN</label>
                                        <input className="input" placeholder="27AADCB2230M1Z3" value={p.supplier_gstin} onChange={e => updatePurchase(idx, "supplier_gstin", e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0, display: "flex", alignItems: "flex-end" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                            <input type="checkbox" checked={p.is_interstate} onChange={e => updatePurchase(idx, "is_interstate", e.target.checked)} />
                                            <span>Inter-State (IGST)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button className="btn btn-primary btn-full" onClick={calculate} disabled={loading} style={{ marginTop: "1rem" }}>
                            {loading ? "Calculating..." : "⚡ Calculate ITC"}
                        </button>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="glass-card" style={{ animation: "slideDown 0.3s ease" }}>
                            <h3 style={{ marginBottom: "1.5rem" }}>📋 ITC Calculation Results</h3>

                            {/* Summary Cards */}
                            <div className="compliance-stats-grid">
                                <div className="comp-stat">
                                    <span className="comp-stat-label">Total Purchase Value</span>
                                    <span className="comp-stat-value">{formatCurrency(result.summary.total_purchase_value)}</span>
                                </div>
                                <div className="comp-stat">
                                    <span className="comp-stat-label">Total Tax Paid</span>
                                    <span className="comp-stat-value">{formatCurrency(result.summary.total_tax_paid)}</span>
                                </div>
                                <div className="comp-stat" style={{ borderColor: "rgba(34, 197, 94, 0.3)" }}>
                                    <span className="comp-stat-label">✅ Eligible ITC</span>
                                    <span className="comp-stat-value" style={{ color: "#22c55e" }}>{formatCurrency(result.summary.eligible_itc)}</span>
                                </div>
                                <div className="comp-stat" style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
                                    <span className="comp-stat-label">❌ Ineligible ITC</span>
                                    <span className="comp-stat-value" style={{ color: "#ef4444" }}>{formatCurrency(result.summary.ineligible_itc)}</span>
                                </div>
                            </div>

                            {/* Tax Breakdown */}
                            <div className="breakdown-grid" style={{ marginTop: "1.5rem" }}>
                                <div className="breakdown-item highlight-cgst">
                                    <span className="breakdown-label">CGST</span>
                                    <span className="breakdown-value">{formatCurrency(result.summary.total_cgst)}</span>
                                </div>
                                <div className="breakdown-item highlight-sgst">
                                    <span className="breakdown-label">SGST</span>
                                    <span className="breakdown-value">{formatCurrency(result.summary.total_sgst)}</span>
                                </div>
                                <div className="breakdown-item highlight-igst">
                                    <span className="breakdown-label">IGST</span>
                                    <span className="breakdown-value">{formatCurrency(result.summary.total_igst)}</span>
                                </div>
                                {result.summary.total_cess > 0 && (
                                    <div className="breakdown-item highlight-cess">
                                        <span className="breakdown-label">Compensation Cess</span>
                                        <span className="breakdown-value">{formatCurrency(result.summary.total_cess)}</span>
                                    </div>
                                )}
                                <div className="breakdown-item grand-total">
                                    <span className="breakdown-label">Net ITC Claimable</span>
                                    <span className="breakdown-value">{formatCurrency(result.summary.net_itc_claimable)}</span>
                                </div>
                            </div>

                            {/* Per-item Breakdown */}
                            <h4 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Line-by-line Breakdown</h4>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Description</th>
                                            <th>Value</th>
                                            <th>Tax</th>
                                            <th>Eligible</th>
                                            <th>Claimable ITC</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.purchases.map(p => (
                                            <tr key={p.sr}>
                                                <td>{p.sr}</td>
                                                <td>{p.description || "—"}</td>
                                                <td>{formatCurrency(p.value)}</td>
                                                <td>{formatCurrency(p.total_tax)}</td>
                                                <td>
                                                    {p.eligible ? (
                                                        <span className="status-badge paid">✅ {p.business_use_percent}%</span>
                                                    ) : (
                                                        <span className="status-badge unpaid" title={p.reason}>❌ Blocked</span>
                                                    )}
                                                </td>
                                                <td className="total-cell">{formatCurrency(p.claimable_itc)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Ineligible items warning */}
                            {result.purchases.some(p => !p.eligible) && (
                                <div className="alert-item alert-warning" style={{ marginTop: "1rem" }}>
                                    ⚠️ Some purchases are blocked under <strong>Section 17(5) of CGST Act</strong> — ITC cannot be claimed for motor vehicles, food, beverages, personal consumption, etc.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {activeTab === "advisory" && (
                <div className="glass-card">
                    <h3>🤖 AI Tax Advisory</h3>
                    <p className="lookup-hint">Describe your tax scenario and get AI-powered GST advice (powered by Groq Llama)</p>

                    <div className="form-group">
                        <label>Your Tax Scenario</label>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="e.g., I'm a freelance software developer billing clients in the US. What GST implications do I have? Can I claim ITC on my laptop purchase?"
                            value={adviceQuery}
                            onChange={e => setAdviceQuery(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={getAdvice} disabled={adviceLoading || !adviceQuery.trim()}>
                        {adviceLoading ? "🤔 Analyzing..." : "🤖 Get AI Advice"}
                    </button>

                    {adviceLoading && (
                        <div className="ai-thinking">
                            <div className="thinking-dots"><span></span><span></span><span></span></div>
                            <p>AI is analyzing your scenario...</p>
                        </div>
                    )}

                    {advice && !adviceLoading && (
                        <div style={{ marginTop: "1.5rem" }}>
                            {advice.error ? (
                                <div className="alert-item alert-danger">❌ {advice.error}</div>
                            ) : advice.advice ? (
                                <div className="ai-result-card glass-card-inner">
                                    <div className="ai-result-header">
                                        <span className="ai-badge">🤖 AI Advisory</span>
                                    </div>
                                    <div className="result-description">
                                        {typeof advice.advice === "string"
                                            ? advice.advice
                                            : JSON.stringify(advice.advice, null, 2)
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="alert-item alert-warning">⚠️ No advice generated. Try rephrasing your scenario.</div>
                            )}
                        </div>
                    )}

                    {/* Common Scenarios */}
                    <div style={{ marginTop: "2rem" }}>
                        <h4 style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>💡 Common Scenarios</h4>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {[
                                "Can I claim ITC on restaurant bills?",
                                "ITC on office furniture and electronics",
                                "GST on international software services",
                                "ITC for mixed-use (personal + business) assets",
                                "Reverse Charge Mechanism for unregistered suppliers",
                            ].map(s => (
                                <button key={s} className="recent-tag" onClick={() => setAdviceQuery(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
