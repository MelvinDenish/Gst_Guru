import { useState } from "react";
import { calculateAPI } from "../api";

export default function PricingTool() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        cost_price: "",
        desired_margin_percent: "20",
        gst_rate: "18",
        cess_rate: "0",
        is_interstate: false,
        quantity: "1",
    });

    const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(""); setResult(null);
        try {
            const { data } = await calculateAPI.pricing(form);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.error || "Calculation failed");
        } finally { setLoading(false); }
    };

    const commonRates = [0, 5, 12, 18, 28];

    return (
        <div className="page pricing-page">
            <div className="page-header">
                <h1>🏷️ GST <span className="gradient-text">Pricing Tool</span></h1>
                <p className="subtitle">Calculate the right selling price — factor in cost, margin, and GST to set profitable prices</p>
            </div>

            <form onSubmit={handleSubmit} className="pricing-form glass-card">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Cost Price (₹) *</label>
                        <input type="number" step="0.01" min="0.01" required placeholder="e.g., 500"
                            value={form.cost_price} onChange={e => update("cost_price", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Desired Margin (%)</label>
                        <input type="number" step="0.1" min="0" placeholder="20"
                            value={form.desired_margin_percent} onChange={e => update("desired_margin_percent", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>GST Rate (%)</label>
                        <div className="rate-pills">
                            {commonRates.map(r => (
                                <button type="button" key={r}
                                    className={`pill ${form.gst_rate === String(r) ? "pill-active" : ""}`}
                                    onClick={() => update("gst_rate", String(r))}>{r}%</button>
                            ))}
                        </div>
                        <input type="number" step="0.1" min="0" value={form.gst_rate}
                            onChange={e => update("gst_rate", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Cess Rate (%)</label>
                        <input type="number" step="0.1" min="0" placeholder="0"
                            value={form.cess_rate} onChange={e => update("cess_rate", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input type="number" min="1" value={form.quantity}
                            onChange={e => update("quantity", e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={form.is_interstate}
                                onChange={e => update("is_interstate", e.target.checked)} />
                            Inter-state supply (IGST)
                        </label>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                    {loading ? "Calculating..." : "Calculate Pricing"}
                </button>
            </form>

            {error && <div className="alert alert-danger">{error}</div>}

            {result && (
                <div className="pricing-results">
                    {/* Primary Result */}
                    <div className="pricing-hero glass-card">
                        <div className="pricing-hero-grid">
                            <div className="pricing-col">
                                <span className="pricing-label">Cost Price</span>
                                <span className="pricing-value">₹{result.pricing.cost_price.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="pricing-arrow">→</div>
                            <div className="pricing-col">
                                <span className="pricing-label">Selling Price (excl. GST)</span>
                                <span className="pricing-value highlight">₹{result.pricing.selling_price_excl_gst.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="pricing-arrow">+</div>
                            <div className="pricing-col">
                                <span className="pricing-label">Tax per Unit</span>
                                <span className="pricing-value text-warning">₹{result.tax_breakdown.tax_per_unit.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="pricing-arrow">=</div>
                            <div className="pricing-col">
                                <span className="pricing-label">MRP (incl. GST)</span>
                                <span className="pricing-value pricing-mrp">₹{result.pricing.mrp_incl_gst.toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Profit & Tax Breakdown */}
                    <div className="pricing-details">
                        <div className="pricing-card glass-card">
                            <h3>💹 Profit Analysis</h3>
                            <div className="detail-row"><span>Cost Price</span><span>₹{result.pricing.cost_price}</span></div>
                            <div className="detail-row"><span>Selling Price</span><span>₹{result.pricing.selling_price_excl_gst}</span></div>
                            <div className="detail-row highlight-row"><span>Profit per Unit</span><span className="text-success">₹{result.pricing.profit_per_unit}</span></div>
                            <div className="detail-row"><span>Profit Margin</span><span>{result.pricing.profit_margin_actual.toFixed(1)}%</span></div>
                        </div>

                        <div className="pricing-card glass-card">
                            <h3>🧾 Tax Breakdown</h3>
                            <div className="detail-row"><span>GST Rate</span><span>{result.tax_breakdown.gst_rate}%</span></div>
                            {result.tax_breakdown.is_interstate ? (
                                <div className="detail-row"><span>IGST</span><span>₹{result.tax_breakdown.igst}</span></div>
                            ) : (
                                <>
                                    <div className="detail-row"><span>CGST ({result.tax_breakdown.gst_rate / 2}%)</span><span>₹{result.tax_breakdown.cgst}</span></div>
                                    <div className="detail-row"><span>SGST ({result.tax_breakdown.gst_rate / 2}%)</span><span>₹{result.tax_breakdown.sgst}</span></div>
                                </>
                            )}
                            {result.tax_breakdown.cess > 0 && (
                                <div className="detail-row"><span>Cess ({result.tax_breakdown.cess_rate}%)</span><span>₹{result.tax_breakdown.cess}</span></div>
                            )}
                            <div className="detail-row highlight-row"><span>Total Tax/Unit</span><span className="text-warning">₹{result.tax_breakdown.tax_per_unit}</span></div>
                        </div>

                        {parseInt(form.quantity) > 1 && (
                            <div className="pricing-card glass-card">
                                <h3>📦 Bulk ({result.bulk.quantity} units)</h3>
                                <div className="detail-row"><span>Total Selling</span><span>₹{result.bulk.total_selling.toLocaleString("en-IN")}</span></div>
                                <div className="detail-row"><span>Total Tax</span><span>₹{result.bulk.total_tax.toLocaleString("en-IN")}</span></div>
                                <div className="detail-row"><span>Total MRP</span><span>₹{result.bulk.total_mrp.toLocaleString("en-IN")}</span></div>
                                <div className="detail-row highlight-row"><span>Total Profit</span><span className="text-success">₹{result.bulk.total_profit.toLocaleString("en-IN")}</span></div>
                            </div>
                        )}
                    </div>

                    {/* Margin Scenarios */}
                    <div className="scenarios-section glass-card">
                        <h3>📊 Margin Scenarios</h3>
                        <p className="section-desc">Compare different margin levels at cost price ₹{result.pricing.cost_price}</p>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Margin</th>
                                    <th>Selling Price</th>
                                    <th>Tax</th>
                                    <th>MRP</th>
                                    <th>Profit/Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.margin_scenarios.map(s => (
                                    <tr key={s.margin_percent}
                                        className={s.margin_percent === result.input.desired_margin_percent ? "row-highlight" : ""}>
                                        <td><span className={`slab-badge slab-badge-${s.margin_percent}`}>{s.margin_percent}%</span></td>
                                        <td>₹{s.selling_price.toLocaleString("en-IN")}</td>
                                        <td>₹{s.tax_per_unit.toLocaleString("en-IN")}</td>
                                        <td className="total-cell">₹{s.mrp.toLocaleString("en-IN")}</td>
                                        <td className="text-success">₹{s.profit_per_unit.toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MRP Targets */}
                    <div className="mrp-targets glass-card">
                        <h3>🎯 MRP Target Analysis</h3>
                        <p className="section-desc">What's the maximum cost you can afford at common MRP points with {result.input.desired_margin_percent}% margin?</p>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Target MRP</th>
                                    <th>Base Price (excl. GST)</th>
                                    <th>Max Cost</th>
                                    <th>Profit/Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.mrp_targets.map(t => (
                                    <tr key={t.target_mrp}>
                                        <td className="total-cell">₹{t.target_mrp}</td>
                                        <td>₹{t.base_price.toLocaleString("en-IN")}</td>
                                        <td>₹{t.max_cost_for_margin.toLocaleString("en-IN")}</td>
                                        <td className="text-success">₹{t.profit_at_margin.toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
