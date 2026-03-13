import { useState, useEffect } from "react";
import { insightsAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function BusinessInsights() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overpay");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Overpay state
    const [overpayData, setOverpayData] = useState(null);

    // ITC Recon state
    const [itcData, setItcData] = useState(null);
    const [itcFrom, setItcFrom] = useState(() => {
        const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    });
    const [itcTo, setItcTo] = useState(() => {
        const d = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        return d.toISOString().split("T")[0];
    });

    // Rate Impact state
    const [rateImpact, setRateImpact] = useState(null);
    const [rateForm, setRateForm] = useState({
        hsn_sac_code: "", old_rate: "", new_rate: "",
        monthly_volume: "", unit_price: "", desired_margin_percent: "20",
    });

    // Annual Summary state
    const [annualData, setAnnualData] = useState(null);
    const [financialYear, setFinancialYear] = useState(() => {
        const now = new Date();
        const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        return `${fy}-${String((fy + 1) % 100).padStart(2, "0")}`;
    });

    // Load overpay data on mount
    useEffect(() => { if (activeTab === "overpay" && !overpayData) loadOverpay(); }, [activeTab]);

    const loadOverpay = async () => {
        setLoading(true); setError("");
        try {
            const { data } = await insightsAPI.overpayCheck();
            setOverpayData(data);
        } catch (err) { setError(err.response?.data?.error || "Failed to load"); }
        finally { setLoading(false); }
    };

    const loadITC = async () => {
        setLoading(true); setError("");
        try {
            const { data } = await insightsAPI.itcReconciliation({ from: itcFrom, to: itcTo });
            setItcData(data);
        } catch (err) { setError(err.response?.data?.error || "Failed to load"); }
        finally { setLoading(false); }
    };

    const loadRateImpact = async (e) => {
        e.preventDefault(); setLoading(true); setError("");
        try {
            const { data } = await insightsAPI.rateImpact(rateForm);
            setRateImpact(data);
        } catch (err) { setError(err.response?.data?.error || "Failed to analyze"); }
        finally { setLoading(false); }
    };

    const loadAnnualSummary = async () => {
        setLoading(true); setError("");
        try {
            const { data } = await insightsAPI.annualSummary({ financial_year: financialYear });
            setAnnualData(data);
        } catch (err) { setError(err.response?.data?.error || "Failed to load"); }
        finally { setLoading(false); }
    };

    const tabs = [
        { id: "overpay", label: "🔍 Overpay Detector", icon: "🔍" },
        { id: "itc", label: "📊 ITC Reconciliation", icon: "📊" },
        { id: "impact", label: "📈 Rate Impact", icon: "📈" },
        { id: "annual", label: "📋 Annual Summary", icon: "📋" },
    ];

    return (
        <div className="page insights-page">
            <div className="page-header">
                <h1>💡 Business <span className="gradient-text">Insights</span></h1>
                <p className="subtitle">Proactive intelligence to save money and stay compliant</p>
            </div>

            <div className="insights-tabs">
                {tabs.map(t => (
                    <button key={t.id} className={`insight-tab ${activeTab === t.id ? "active" : ""}`}
                        onClick={() => setActiveTab(t.id)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* ══════ OVERPAY DETECTOR ══════ */}
            {activeTab === "overpay" && (
                <div className="insight-section">
                    <div className="section-header">
                        <h2>🔍 Overpayment / Underpayment Detector</h2>
                        <button className="btn btn-primary" onClick={loadOverpay} disabled={loading}>
                            {loading ? "Checking..." : "⟳ Refresh"}
                        </button>
                    </div>
                    <p className="section-desc">Compares the GST rate you charge (default_rate on your products) with the actual current system rate.</p>

                    {overpayData && (
                        <>
                            <div className="insight-stats">
                                <div className={`stat-card glass-card ${overpayData.summary.mismatched > 0 ? "stat-danger" : "stat-success"}`}>
                                    <span className="stat-icon">{overpayData.summary.mismatched > 0 ? "⚠️" : "✅"}</span>
                                    <span className="stat-value">{overpayData.summary.mismatched}</span>
                                    <span className="stat-label">Mismatched Rates</span>
                                </div>
                                <div className="stat-card glass-card stat-warning">
                                    <span className="stat-icon">📈</span>
                                    <span className="stat-value">{overpayData.summary.overpaying}</span>
                                    <span className="stat-label">Overcharging</span>
                                </div>
                                <div className="stat-card glass-card stat-danger">
                                    <span className="stat-icon">📉</span>
                                    <span className="stat-value">{overpayData.summary.underpaying}</span>
                                    <span className="stat-label">Undercharging</span>
                                </div>
                                <div className="stat-card glass-card">
                                    <span className="stat-icon">✅</span>
                                    <span className="stat-value">{overpayData.summary.correct}</span>
                                    <span className="stat-label">Correct</span>
                                </div>
                            </div>

                            {overpayData.summary.annual_impact !== 0 && (
                                <div className={`impact-banner glass-card ${overpayData.summary.annual_impact > 0 ? "impact-loss" : "impact-overpay"}`}>
                                    <span className="impact-icon">💰</span>
                                    <div>
                                        <strong>Estimated Annual Impact: ₹{Math.abs(overpayData.summary.annual_impact).toLocaleString("en-IN")}</strong>
                                        <p>{overpayData.summary.annual_impact > 0
                                            ? "You're undercharging GST — potential audit risk and tax liability"
                                            : "You're overcharging GST — customers pay more than required"}</p>
                                    </div>
                                </div>
                            )}

                            {overpayData.products.length > 0 ? (
                                <div className="table-wrapper glass-card">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>HSN Code</th>
                                                <th>Product</th>
                                                <th>Your Rate</th>
                                                <th>Correct Rate</th>
                                                <th>Diff</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {overpayData.products.map(p => (
                                                <tr key={p.id} className={`row-${p.status}`}>
                                                    <td><span className="code-badge">{p.hsn_sac_code}</span></td>
                                                    <td>{p.description}</td>
                                                    <td>{p.your_rate !== null ? `${p.your_rate}%` : "—"}</td>
                                                    <td>{p.system_rate !== null ? `${p.system_rate}%` : "—"}</td>
                                                    <td className={p.difference > 0 ? "text-warning" : p.difference < 0 ? "text-danger" : "text-success"}>
                                                        {p.difference !== undefined ? `${p.difference > 0 ? "+" : ""}${p.difference}%` : "—"}
                                                    </td>
                                                    <td><span className={`status-badge status-${p.status}`}>{p.message}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state glass-card">
                                    <p>No products found. Add products with a default rate in the Products page to enable detection.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ══════ ITC RECONCILIATION ══════ */}
            {activeTab === "itc" && (
                <div className="insight-section">
                    <div className="section-header">
                        <h2>📊 ITC Reconciliation</h2>
                    </div>
                    <p className="section-desc">Compare your purchase invoices' input tax vs claimable ITC for a given period.</p>

                    <div className="filter-bar glass-card">
                        <div className="filter-group">
                            <label>From</label>
                            <input type="date" className="input" value={itcFrom} onChange={e => setItcFrom(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>To</label>
                            <input type="date" className="input" value={itcTo} onChange={e => setItcTo(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={loadITC} disabled={loading}>
                            {loading ? "Loading..." : "Reconcile"}
                        </button>
                    </div>

                    {itcData && (
                        <>
                            <div className="insight-stats">
                                <div className="stat-card glass-card">
                                    <span className="stat-icon">🧾</span>
                                    <span className="stat-value">{itcData.summary.total_purchase_invoices}</span>
                                    <span className="stat-label">Purchase Invoices</span>
                                </div>
                                <div className="stat-card glass-card">
                                    <span className="stat-icon">💰</span>
                                    <span className="stat-value">₹{itcData.summary.total_input_tax.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Total Input Tax</span>
                                </div>
                                <div className="stat-card glass-card stat-success">
                                    <span className="stat-icon">✅</span>
                                    <span className="stat-value">₹{itcData.summary.eligible_itc.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Eligible ITC</span>
                                </div>
                                <div className="stat-card glass-card stat-danger">
                                    <span className="stat-icon">🚫</span>
                                    <span className="stat-value">₹{itcData.summary.ineligible_itc.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Ineligible ITC</span>
                                </div>
                                <div className="stat-card glass-card stat-warning">
                                    <span className="stat-icon">📊</span>
                                    <span className="stat-value">₹{itcData.summary.net_liability.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Net Liability</span>
                                </div>
                                <div className="stat-card glass-card">
                                    <span className="stat-icon">⚠️</span>
                                    <span className="stat-value">{itcData.summary.invoices_with_issues}</span>
                                    <span className="stat-label">Issues Found</span>
                                </div>
                            </div>

                            {itcData.summary.total_output_tax > 0 && itcData.summary.eligible_itc > 0 && (
                                <div className="impact-banner glass-card impact-success">
                                    <span className="impact-icon">💡</span>
                                    <div>
                                        <strong>ITC Savings: ₹{itcData.summary.eligible_itc.toLocaleString("en-IN")}</strong>
                                        <p>Your eligible ITC reduces your net tax liability from ₹{itcData.summary.total_output_tax.toLocaleString("en-IN")} to ₹{itcData.summary.net_liability.toLocaleString("en-IN")}.</p>
                                    </div>
                                </div>
                            )}

                            {itcData.invoices.length > 0 && (
                                <div className="table-wrapper glass-card">
                                    <h3>Purchase Invoice Breakdown</h3>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Date</th>
                                                <th>Seller</th>
                                                <th>GSTIN</th>
                                                <th>Value</th>
                                                <th>Tax</th>
                                                <th>ITC Eligible</th>
                                                <th>Issues</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {itcData.invoices.map(inv => (
                                                <tr key={inv.id} className={inv.issues.length > 0 ? "row-warning" : ""}>
                                                    <td>{inv.invoice_number}</td>
                                                    <td>{inv.invoice_date}</td>
                                                    <td>{inv.seller_name || "—"}</td>
                                                    <td><span className={inv.seller_gstin === "MISSING" ? "text-danger" : ""}>{inv.seller_gstin}</span></td>
                                                    <td>₹{inv.subtotal.toLocaleString("en-IN")}</td>
                                                    <td>₹{inv.input_tax.toLocaleString("en-IN")}</td>
                                                    <td><span className={`status-badge ${inv.eligible ? "status-correct" : "status-underpaying"}`}>{inv.eligible ? "Yes" : "No"}</span></td>
                                                    <td>{inv.issues.length > 0 ? inv.issues.map((iss, i) => <div key={i} className="issue-tag">⚠ {iss}</div>) : "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {itcData.invoices.length === 0 && (
                                <div className="empty-state glass-card">
                                    <p>No purchase invoices found for this period. Add purchase invoices to enable reconciliation.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ══════ RATE CHANGE IMPACT ══════ */}
            {activeTab === "impact" && (
                <div className="insight-section">
                    <div className="section-header">
                        <h2>📈 Rate Change Impact Analysis</h2>
                    </div>
                    <p className="section-desc">See how a GST rate change affects your costs, pricing, and margins.</p>

                    <form onSubmit={loadRateImpact} className="insight-form glass-card">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>HSN/SAC Code (optional)</label>
                                <input type="text" className="input" placeholder="e.g., 6109"
                                    value={rateForm.hsn_sac_code} onChange={e => setRateForm(p => ({ ...p, hsn_sac_code: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Old Rate (%)*</label>
                                <input type="number" className="input" step="0.1" required placeholder="e.g., 5"
                                    value={rateForm.old_rate} onChange={e => setRateForm(p => ({ ...p, old_rate: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>New Rate (%)*</label>
                                <input type="number" className="input" step="0.1" required placeholder="e.g., 12"
                                    value={rateForm.new_rate} onChange={e => setRateForm(p => ({ ...p, new_rate: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Unit Price (₹)</label>
                                <input type="number" className="input" step="0.01" placeholder="e.g., 500"
                                    value={rateForm.unit_price} onChange={e => setRateForm(p => ({ ...p, unit_price: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Monthly Volume (units)</label>
                                <input type="number" className="input" placeholder="e.g., 1000"
                                    value={rateForm.monthly_volume} onChange={e => setRateForm(p => ({ ...p, monthly_volume: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Desired Margin (%)</label>
                                <input type="number" className="input" step="0.1" placeholder="20"
                                    value={rateForm.desired_margin_percent} onChange={e => setRateForm(p => ({ ...p, desired_margin_percent: e.target.value }))} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? "Analyzing..." : "Analyze Impact"}
                        </button>
                    </form>

                    {rateImpact && (
                        <div className="rate-impact-results">
                            <div className={`impact-banner glass-card ${rateImpact.rate_change.direction === "increase" ? "impact-loss" : rateImpact.rate_change.direction === "decrease" ? "impact-success" : ""}`}>
                                <span className="impact-icon">{rateImpact.rate_change.direction === "increase" ? "📈" : rateImpact.rate_change.direction === "decrease" ? "📉" : "➡️"}</span>
                                <div>
                                    <strong>Rate {rateImpact.rate_change.direction === "increase" ? "Increased" : rateImpact.rate_change.direction === "decrease" ? "Decreased" : "Unchanged"}: {rateImpact.rate_change.old_rate}% → {rateImpact.rate_change.new_rate}%</strong>
                                    {rateImpact.hsn_description && <p>{rateImpact.hsn_description}</p>}
                                </div>
                            </div>

                            {rateImpact.per_unit.base_price > 0 && (
                                <div className="insight-stats">
                                    <div className="stat-card glass-card">
                                        <span className="stat-icon">🏷️</span>
                                        <span className="stat-value">₹{rateImpact.per_unit.old_mrp}</span>
                                        <span className="stat-label">Old MRP</span>
                                    </div>
                                    <div className="stat-card glass-card">
                                        <span className="stat-icon">🏷️</span>
                                        <span className="stat-value">₹{rateImpact.per_unit.new_mrp}</span>
                                        <span className="stat-label">New MRP</span>
                                    </div>
                                    <div className={`stat-card glass-card ${rateImpact.per_unit.mrp_difference > 0 ? "stat-danger" : "stat-success"}`}>
                                        <span className="stat-icon">{rateImpact.per_unit.mrp_difference > 0 ? "📈" : "📉"}</span>
                                        <span className="stat-value">₹{Math.abs(rateImpact.per_unit.mrp_difference)}</span>
                                        <span className="stat-label">MRP Change/Unit</span>
                                    </div>
                                </div>
                            )}

                            {rateImpact.volume_impact.monthly_volume > 0 && (
                                <div className="insight-stats">
                                    <div className={`stat-card glass-card ${rateImpact.volume_impact.monthly_tax_impact > 0 ? "stat-danger" : "stat-success"}`}>
                                        <span className="stat-icon">📅</span>
                                        <span className="stat-value">₹{Math.abs(rateImpact.volume_impact.monthly_tax_impact).toLocaleString("en-IN")}</span>
                                        <span className="stat-label">Monthly Tax {rateImpact.volume_impact.monthly_tax_impact > 0 ? "Increase" : "Savings"}</span>
                                    </div>
                                    <div className={`stat-card glass-card ${rateImpact.volume_impact.annual_tax_impact > 0 ? "stat-danger" : "stat-success"}`}>
                                        <span className="stat-icon">📆</span>
                                        <span className="stat-value">₹{Math.abs(rateImpact.volume_impact.annual_tax_impact).toLocaleString("en-IN")}</span>
                                        <span className="stat-label">Annual Tax {rateImpact.volume_impact.annual_tax_impact > 0 ? "Increase" : "Savings"}</span>
                                    </div>
                                </div>
                            )}

                            {rateImpact.pricing_advice.recommendation && (
                                <div className="advice-card glass-card">
                                    <h3>💡 Pricing Advice</h3>
                                    <p>{rateImpact.pricing_advice.recommendation}</p>
                                    {rateImpact.per_unit.base_price > 0 && (
                                        <p className="advice-detail">To maintain old MRP (₹{rateImpact.per_unit.old_mrp}), set base price to <strong>₹{rateImpact.pricing_advice.to_maintain_old_mrp}</strong></p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ══════ ANNUAL SUMMARY ══════ */}
            {activeTab === "annual" && (
                <div className="insight-section">
                    <div className="section-header">
                        <h2>📋 Annual GST Summary</h2>
                    </div>
                    <p className="section-desc">Your complete GST year in review — revenue, tax, compliance, and savings opportunities.</p>

                    <div className="filter-bar glass-card">
                        <div className="filter-group">
                            <label>Financial Year</label>
                            <select className="input" value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                                {[...Array(5)].map((_, i) => {
                                    const y = new Date().getFullYear() - i;
                                    const fy = `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
                                    return <option key={fy} value={fy}>{fy}</option>;
                                })}
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={loadAnnualSummary} disabled={loading}>
                            {loading ? "Generating..." : "Generate Report"}
                        </button>
                    </div>

                    {annualData && (
                        <>
                            {/* Revenue & Tax Overview */}
                            <div className="insight-stats">
                                <div className="stat-card glass-card">
                                    <span className="stat-icon">💰</span>
                                    <span className="stat-value">₹{annualData.revenue.total_sales.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Total Sales</span>
                                </div>
                                <div className="stat-card glass-card">
                                    <span className="stat-icon">🛒</span>
                                    <span className="stat-value">₹{annualData.revenue.total_purchases.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Total Purchases</span>
                                </div>
                                <div className="stat-card glass-card stat-warning">
                                    <span className="stat-icon">📤</span>
                                    <span className="stat-value">₹{annualData.tax.output_tax.total.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Output Tax (Collected)</span>
                                </div>
                                <div className="stat-card glass-card stat-success">
                                    <span className="stat-icon">📥</span>
                                    <span className="stat-value">₹{annualData.tax.input_tax.total.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Input Tax (Paid)</span>
                                </div>
                                <div className="stat-card glass-card stat-danger">
                                    <span className="stat-icon">🏛️</span>
                                    <span className="stat-value">₹{annualData.tax.net_liability.toLocaleString("en-IN")}</span>
                                    <span className="stat-label">Net Tax Liability</span>
                                </div>
                                <div className={`stat-card glass-card ${annualData.compliance.compliance_rate >= 80 ? "stat-success" : "stat-danger"}`}>
                                    <span className="stat-icon">📊</span>
                                    <span className="stat-value">{annualData.compliance.compliance_rate}%</span>
                                    <span className="stat-label">Compliance Rate</span>
                                </div>
                            </div>

                            {/* Tax Breakdown */}
                            <div className="annual-breakdown glass-card">
                                <h3>Tax Breakdown</h3>
                                <div className="breakdown-grid">
                                    <div className="breakdown-col">
                                        <h4>Output Tax (Collected from Sales)</h4>
                                        <div className="breakdown-row"><span>CGST</span><span>₹{annualData.tax.output_tax.cgst.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row"><span>SGST</span><span>₹{annualData.tax.output_tax.sgst.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row"><span>IGST</span><span>₹{annualData.tax.output_tax.igst.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row"><span>Cess</span><span>₹{annualData.tax.output_tax.cess.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row total"><span>Total</span><span>₹{annualData.tax.output_tax.total.toLocaleString("en-IN")}</span></div>
                                    </div>
                                    <div className="breakdown-col">
                                        <h4>Input Tax (Paid on Purchases)</h4>
                                        <div className="breakdown-row"><span>CGST</span><span>₹{annualData.tax.input_tax.cgst.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row"><span>SGST</span><span>₹{annualData.tax.input_tax.sgst.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row"><span>IGST</span><span>₹{annualData.tax.input_tax.igst.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row"><span>Cess</span><span>₹{annualData.tax.input_tax.cess.toLocaleString("en-IN")}</span></div>
                                        <div className="breakdown-row total"><span>Total</span><span>₹{annualData.tax.input_tax.total.toLocaleString("en-IN")}</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance */}
                            <div className="annual-compliance glass-card">
                                <h3>Filing Compliance</h3>
                                <div className="insight-stats">
                                    <div className="stat-card"><span className="stat-value">{annualData.compliance.total_filings}</span><span className="stat-label">Total Filings</span></div>
                                    <div className="stat-card stat-success"><span className="stat-value">{annualData.compliance.filed_on_time}</span><span className="stat-label">On Time</span></div>
                                    <div className="stat-card stat-danger"><span className="stat-value">{annualData.compliance.filed_late}</span><span className="stat-label">Late</span></div>
                                    <div className="stat-card stat-warning"><span className="stat-value">{annualData.compliance.pending}</span><span className="stat-label">Pending</span></div>
                                    <div className="stat-card"><span className="stat-value">₹{annualData.compliance.total_late_fees.toLocaleString("en-IN")}</span><span className="stat-label">Late Fees Paid</span></div>
                                </div>
                            </div>

                            {/* Savings Tips */}
                            {annualData.savings.tips.length > 0 && (
                                <div className="savings-section">
                                    <h3>💡 Savings Opportunities</h3>
                                    {annualData.savings.total_potential_savings > 0 && (
                                        <div className="impact-banner glass-card impact-success">
                                            <span className="impact-icon">💰</span>
                                            <div><strong>Potential Savings: ₹{annualData.savings.total_potential_savings.toLocaleString("en-IN")}</strong></div>
                                        </div>
                                    )}
                                    {annualData.savings.tips.map((tip, i) => (
                                        <div key={i} className={`tip-card glass-card tip-${tip.type}`}>
                                            <h4>{tip.title}</h4>
                                            <p>{tip.message}</p>
                                            {tip.potential_savings > 0 && (
                                                <span className="tip-savings">Potential savings: ₹{tip.potential_savings.toLocaleString("en-IN")}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Monthly Breakdown */}
                            {annualData.monthly_breakdown.length > 0 && (
                                <div className="monthly-breakdown glass-card">
                                    <h3>Monthly Breakdown</h3>
                                    <table className="data-table">
                                        <thead>
                                            <tr><th>Month</th><th>Sales</th><th>Output Tax</th><th>Purchases</th><th>Input Tax</th><th>Net Liability</th></tr>
                                        </thead>
                                        <tbody>
                                            {annualData.monthly_breakdown.map(m => (
                                                <tr key={m.month}>
                                                    <td><strong>{m.month}</strong></td>
                                                    <td>₹{m.sales.toLocaleString("en-IN")}</td>
                                                    <td>₹{m.output_tax.toLocaleString("en-IN")}</td>
                                                    <td>₹{m.purchases.toLocaleString("en-IN")}</td>
                                                    <td>₹{m.input_tax.toLocaleString("en-IN")}</td>
                                                    <td className="total-cell">₹{m.net_liability.toLocaleString("en-IN")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {!annualData && !loading && (
                        <div className="empty-state glass-card">
                            <p>Select a financial year and click "Generate Report" to see your annual GST summary.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
