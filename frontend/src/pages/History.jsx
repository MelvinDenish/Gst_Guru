import { useState, useEffect } from "react";
import { calculationsAPI, invoiceAPI } from "../api";
import Toast from "../components/Toast";

export default function History() {
    const [calculations, setCalculations] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const loadHistory = async (page = 1) => {
        setLoading(true);
        try {
            const { data } = await calculationsAPI.history({ page, limit: 15 });
            setCalculations(data.calculations || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch { setToast({ message: "Failed to load history", type: "error" }); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadHistory(); }, []);

    const exportCSV = async () => {
        try {
            const { data } = await calculationsAPI.exportCSV();
            const url = window.URL.createObjectURL(new Blob([data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = "gst_calculations.csv";
            a.click();
            window.URL.revokeObjectURL(url);
            setToast({ message: "CSV exported!", type: "success" });
        } catch { setToast({ message: "Export failed", type: "error" }); }
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page history-page">
            <div className="page-header">
                <h1>📋 Calculation History</h1>
                <button className="btn btn-secondary" onClick={exportCSV} disabled={calculations.length === 0}>
                    📥 Export CSV
                </button>
            </div>

            {calculations.length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">📋</span>
                    <h3>No history yet</h3>
                    <p>Calculations will appear here once you make them</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper glass-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>HSN/SAC</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Qty</th>
                                    <th>Rate</th>
                                    <th>CGST</th>
                                    <th>SGST</th>
                                    <th>IGST</th>
                                    <th>Total</th>
                                    <th>Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculations.map((c) => (
                                    <tr key={c.id}>
                                        <td>{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                                        <td><span className="code-badge">{c.hsn_sac_code}</span></td>
                                        <td className="desc-cell">{c.product_description?.split("—")[0]}</td>
                                        <td>₹{Number(c.taxable_value).toLocaleString("en-IN")}</td>
                                        <td>{c.quantity}</td>
                                        <td><span className={`slab-badge slab-badge-${c.rate_used}`}>{c.rate_used}%</span></td>
                                        <td>₹{Number(c.cgst).toLocaleString("en-IN")}</td>
                                        <td>₹{Number(c.sgst).toLocaleString("en-IN")}</td>
                                        <td>₹{Number(c.igst).toLocaleString("en-IN")}</td>
                                        <td className="total-cell">₹{Number(c.total).toLocaleString("en-IN")}</td>
                                        <td>
                                            <button className="btn-icon" title="View Invoice"
                                                onClick={() => window.open(invoiceAPI.getUrl(c.id), '_blank')}>📄</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button className="btn btn-sm" disabled={pagination.page <= 1}
                                onClick={() => loadHistory(pagination.page - 1)}>← Prev</button>
                            <span className="page-info">Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)</span>
                            <button className="btn btn-sm" disabled={pagination.page >= pagination.totalPages}
                                onClick={() => loadHistory(pagination.page + 1)}>Next →</button>
                        </div>
                    )}
                </>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
