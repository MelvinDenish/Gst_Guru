import { useState, useEffect } from "react";
import { complianceAPI } from "../api";
import { getFinancialYears, getCurrentFinancialYear, getCurrentPeriod } from "../utils/constants";
import Toast from "../components/Toast";

export default function ComplianceReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [toast, setToast] = useState(null);

    const [genForm, setGenForm] = useState({
        report_type: "monthly",
        period: getCurrentPeriod(),
        financial_year: getCurrentFinancialYear(),
    });

    const loadReports = async () => {
        setLoading(true);
        try {
            const { data } = await complianceAPI.list();
            setReports(data.reports || []);
        } catch {
            setToast({ message: "Failed to load reports", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReports(); }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            const { data } = await complianceAPI.generate(genForm);
            setToast({ message: "Report generated!", type: "success" });
            setShowModal(false);
            setSelectedReport(data.report);
            loadReports();
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Generation failed", type: "error" });
        } finally {
            setGenerating(false);
        }
    };

    const handleExport = async (id) => {
        try {
            const { data } = await complianceAPI.exportCSV(id);
            const url = window.URL.createObjectURL(new Blob([data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `compliance_report.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            setToast({ message: "Exported!", type: "success" });
        } catch {
            setToast({ message: "Export failed", type: "error" });
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "#10b981";
        if (score >= 60) return "#f59e0b";
        if (score >= 40) return "#f97316";
        return "#ef4444";
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return "Excellent";
        if (score >= 80) return "Good";
        if (score >= 60) return "Fair";
        if (score >= 40) return "Needs Attention";
        return "Critical";
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page compliance-page">
            <div className="page-header">
                <h1>📊 Compliance Reports</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>📈 Generate Report</button>
            </div>

            {/* Detail View */}
            {selectedReport && (
                <div className="compliance-detail glass-card animate-slide-up">
                    <div className="detail-header">
                        <div>
                            <h2>{selectedReport.report_type.charAt(0).toUpperCase() + selectedReport.report_type.slice(1)} Report</h2>
                            <p>{selectedReport.period} • FY {selectedReport.financial_year}</p>
                        </div>
                        <div className="score-circle" style={{ "--score-color": getScoreColor(selectedReport.compliance_score) }}>
                            <svg viewBox="0 0 120 120" className="score-svg">
                                <circle cx="60" cy="60" r="54" className="score-bg" />
                                <circle cx="60" cy="60" r="54" className="score-fill"
                                    style={{
                                        strokeDasharray: `${(selectedReport.compliance_score / 100) * 339.292} 339.292`,
                                        stroke: getScoreColor(selectedReport.compliance_score),
                                    }} />
                            </svg>
                            <div className="score-text">
                                <span className="score-number">{selectedReport.compliance_score}</span>
                                <span className="score-label">{getScoreLabel(selectedReport.compliance_score)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="compliance-stats-grid">
                        <div className="comp-stat">
                            <span className="comp-stat-label">Total Sales</span>
                            <span className="comp-stat-value">₹{Number(selectedReport.total_sales).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Total Purchases</span>
                            <span className="comp-stat-value">₹{Number(selectedReport.total_purchases).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Output Tax</span>
                            <span className="comp-stat-value highlight-cgst">₹{Number(selectedReport.output_tax).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Input Tax (ITC)</span>
                            <span className="comp-stat-value highlight-sgst">₹{Number(selectedReport.input_tax).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Net Liability</span>
                            <span className="comp-stat-value total-cell">₹{Number(selectedReport.net_liability).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Total Invoices</span>
                            <span className="comp-stat-value">{selectedReport.total_invoices}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Filings On Time</span>
                            <span className="comp-stat-value" style={{ color: "#10b981" }}>{selectedReport.filings_on_time}</span>
                        </div>
                        <div className="comp-stat">
                            <span className="comp-stat-label">Filings Late</span>
                            <span className="comp-stat-value" style={{ color: "#ef4444" }}>{selectedReport.filings_late}</span>
                        </div>
                    </div>

                    {/* Alerts */}
                    {selectedReport.alerts_json && selectedReport.alerts_json.length > 0 && (
                        <div className="compliance-alerts">
                            <h3>🔔 Alerts & Recommendations</h3>
                            {selectedReport.alerts_json.map((alert, i) => (
                                <div key={i} className={`alert-item alert-${alert.type}`}>
                                    <span className="alert-icon">
                                        {alert.type === "danger" ? "🚨" :
                                            alert.type === "warning" ? "⚠️" :
                                                alert.type === "success" ? "✅" : "ℹ️"}
                                    </span>
                                    <span>{alert.message}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="detail-actions">
                        <button className="btn btn-secondary" onClick={() => handleExport(selectedReport.id)}>📥 Export CSV</button>
                        <button className="btn btn-secondary" onClick={() => setSelectedReport(null)}>Close</button>
                    </div>
                </div>
            )}

            {/* Reports List */}
            {reports.length === 0 && !selectedReport ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">📊</span>
                    <h3>No compliance reports</h3>
                    <p>Generate your first compliance report to track GST compliance</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Generate Report</button>
                </div>
            ) : (
                <div className="reports-grid">
                    {reports.map(r => (
                        <div key={r.id} className="report-card glass-card" onClick={() => setSelectedReport(r)}>
                            <div className="report-card-header">
                                <span className="report-type">{r.report_type}</span>
                                <span className="report-period">{r.period}</span>
                            </div>
                            <div className="report-score-mini" style={{ color: getScoreColor(r.compliance_score) }}>
                                <span className="score-big">{r.compliance_score}</span>
                                <span className="score-max">/100</span>
                            </div>
                            <div className="report-card-stats">
                                <span>Sales: ₹{Number(r.total_sales).toLocaleString("en-IN")}</span>
                                <span>Net: ₹{Number(r.net_liability).toLocaleString("en-IN")}</span>
                            </div>
                            <span className="report-fy">FY {r.financial_year}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Generate Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal glass-card">
                        <h2>📈 Generate Compliance Report</h2>
                        <form onSubmit={handleGenerate}>
                            <div className="form-group">
                                <label>Report Type</label>
                                <select className="input" value={genForm.report_type}
                                    onChange={e => setGenForm(f => ({ ...f, report_type: e.target.value }))}>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Period</label>
                                <input type="text" className="input" placeholder="e.g., Mar 2026"
                                    value={genForm.period} onChange={e => setGenForm(f => ({ ...f, period: e.target.value }))} required />
                            </div>
                            <div className="form-group">
                                <label>Financial Year</label>
                                <select className="input" value={genForm.financial_year}
                                    onChange={e => setGenForm(f => ({ ...f, financial_year: e.target.value }))}>
                                    {getFinancialYears().map(fy => <option key={fy} value={fy}>{fy}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={generating}>
                                    {generating ? <span className="spinner"></span> : "Generate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
