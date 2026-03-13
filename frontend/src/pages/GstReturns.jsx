import { useState, useEffect } from "react";
import { returnsAPI } from "../api";

export default function GstReturns() {
    const [activeTab, setActiveTab] = useState("prepare"); // prepare or history
    const [returnType, setReturnType] = useState("GSTR-1");
    const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
    const [year, setYear] = useState(new Date().getFullYear());
    
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        if (activeTab === "history") {
            loadHistory();
        }
    }, [activeTab]);

    const loadHistory = async () => {
        try {
            const res = await returnsAPI.history();
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrepare = async () => {
        setLoading(true);
        setError("");
        setData(null);
        try {
            const res = returnType === "GSTR-1" 
                ? await returnsAPI.prepareGstr1(month, year)
                : await returnsAPI.prepareGstr3b(month, year);
            setData(res.data);
        } catch (err) {
            setError(`Failed to prepare ${returnType}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            await returnsAPI.saveDraft({
                return_type: returnType,
                period_month: month,
                period_year: year,
                status: "draft",
                data: data
            });
            alert("Draft saved successfully!");
        } catch (err) {
            alert("Failed to save draft");
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>GST Returns</h2>
                    <p className="text-muted">Auto-prepare GSTR-1 and GSTR-3B from your invoices & expenses.</p>
                </div>
            </div>

            <div className="insights-tabs mb-2">
                <button className={`tab-btn ${activeTab === 'prepare' ? 'active' : ''}`} onClick={() => setActiveTab('prepare')}>
                    Prepare Returns
                </button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    Filing History
                </button>
            </div>

            {activeTab === "prepare" && (
                <div className="card">
                    <div className="filter-row mb-2">
                        <div className="form-group">
                            <label>Return Type</label>
                            <select className="input" value={returnType} onChange={e => setReturnType(e.target.value)}>
                                <option value="GSTR-1">GSTR-1 (Outward Supplies)</option>
                                <option value="GSTR-3B">GSTR-3B (Summary Return)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Period</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select className="input" style={{ flex: 1 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select className="input" style={{ flex: 1 }} value={year} onChange={e => setYear(Number(e.target.value))}>
                                    {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <button className="btn btn-primary" onClick={handlePrepare} disabled={loading}>
                                    {loading ? 'Preparing...' : 'Generate computation'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && <div className="error-card mb-2">{error}</div>}

                    {data && returnType === "GSTR-1" && (
                        <div className="gstr1-results">
                            <h3 className="mb-2">GSTR-1 Summary ({months[month-1]} {year})</h3>
                            <div className="stats-grid mb-2">
                                <div className="stat-card">
                                    <h3>B2B Sales</h3>
                                    <div className="stat-value">₹{(data.total_b2b_sales || 0).toLocaleString()}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>B2C Sales</h3>
                                    <div className="stat-value">₹{(data.total_b2c_sales || 0).toLocaleString()}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Total Invoices</h3>
                                    <div className="stat-value">{data.invoice_count || 0}</div>
                                </div>
                            </div>
                            
                            <h4>Tax Output Summary</h4>
                            <table className="table mb-2">
                                <thead>
                                    <tr>
                                        <th>Tax Type</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>CGST</td><td>₹{(data.total_cgst || 0).toLocaleString()}</td></tr>
                                    <tr><td>SGST</td><td>₹{(data.total_sgst || 0).toLocaleString()}</td></tr>
                                    <tr><td>IGST</td><td>₹{(data.total_igst || 0).toLocaleString()}</td></tr>
                                    <tr><td>CESS</td><td>₹{(data.total_cess || 0).toLocaleString()}</td></tr>
                                </tbody>
                            </table>
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-primary" onClick={handleSaveDraft}>Save Draft</button>
                                <button className="btn btn-secondary" onClick={() => {
                                    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
                                    const link = document.createElement('a');
                                    link.href = URL.createObjectURL(blob);
                                    link.download = `GSTR1_${year}_${month}.json`;
                                    link.click();
                                }}>Download JSON for Portal</button>
                            </div>
                        </div>
                    )}

                    {data && returnType === "GSTR-3B" && (
                        <div className="gstr3b-results">
                            <h3 className="mb-2">GSTR-3B Summary ({months[month-1]} {year})</h3>
                            
                            <div className="form-row">
                                <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                                    <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>3.1 Tax Liability (Output)</h4>
                                    <div><strong>CGST:</strong> ₹{data.liability.cgst.toLocaleString()}</div>
                                    <div><strong>SGST:</strong> ₹{data.liability.sgst.toLocaleString()}</div>
                                    <div><strong>IGST:</strong> ₹{data.liability.igst.toLocaleString()}</div>
                                    <h3 style={{ marginTop: '10px' }}>Total: ₹{data.liability.total.toLocaleString()}</h3>
                                </div>
                                <div className="card" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                                    <h4 style={{ color: '#22c55e', marginBottom: '10px' }}>4. Eligible ITC (Input)</h4>
                                    <div><strong>CGST:</strong> ₹{data.itc.cgst.toLocaleString()}</div>
                                    <div><strong>SGST:</strong> ₹{data.itc.sgst.toLocaleString()}</div>
                                    <div><strong>IGST:</strong> ₹{data.itc.igst.toLocaleString()}</div>
                                    <h3 style={{ marginTop: '10px' }}>Total ITC: ₹{data.itc.total.toLocaleString()}</h3>
                                </div>
                            </div>
                            
                            <div className="card mb-2 mt-2" style={{ textAlign: 'center', background: 'rgba(13, 148, 136, 0.1)' }}>
                                <h3 style={{ color: 'var(--accent-1)' }}>Net Tax Payable in Cash</h3>
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₹{data.net_payable.toLocaleString()}</div>
                            </div>

                            <button className="btn btn-primary" onClick={handleSaveDraft}>Save Draft Summary</button>
                        </div>
                    )}
                    
                    {!data && !loading && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Select period and generate computation to see tax calculations.
                        </div>
                    )}
                </div>
            )}

            {activeTab === "history" && (
                <div className="card">
                    <h3>Drafts & Filed Returns</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Return Type</th>
                                <th>Period</th>
                                <th>Status</th>
                                <th>Date Saved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No returns saved yet.</td></tr>
                            ) : (
                                history.map(h => (
                                    <tr key={h.id}>
                                        <td><strong>{h.return_type}</strong></td>
                                        <td>{months[h.period_month - 1]} {h.period_year}</td>
                                        <td>
                                            <span className={`badge ${h.status === 'filed' ? 'badge-success' : 'badge-warning'}`}>
                                                {h.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{new Date(h.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
