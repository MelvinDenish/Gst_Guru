import { useState, useEffect } from "react";
import { filingsAPI } from "../api";
import Toast from "../components/Toast";

const RETURN_TYPES = ["GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-9C", "CMP-08", "GSTR-4"];
const RETURN_INFO = {
    "GSTR-1": { desc: "Outward supplies", freq: "Monthly", day: 11 },
    "GSTR-3B": { desc: "Summary return", freq: "Monthly", day: 20 },
    "GSTR-9": { desc: "Annual return", freq: "Annual", day: "31 Dec" },
    "GSTR-9C": { desc: "Reconciliation", freq: "Annual", day: "31 Dec" },
    "CMP-08": { desc: "Composition scheme", freq: "Quarterly", day: 18 },
    "GSTR-4": { desc: "Composition annual", freq: "Annual", day: "30 Apr" },
};

export default function FilingRecords() {
    const [filings, setFilings] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);
    const [filterType, setFilterType] = useState("");

    const [form, setForm] = useState({
        return_type: "GSTR-3B", period: "", financial_year: "2025-26",
        due_date: "", filing_date: "", status: "pending",
        total_liability: "", itc_claimed: "", tax_paid: "",
        late_fee: "", arn_number: "", notes: "",
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterType) params.return_type = filterType;
            const [filingsRes, upcomingRes] = await Promise.all([
                filingsAPI.list(params),
                filingsAPI.upcoming(),
            ]);
            setFilings(filingsRes.data.filings || []);
            setUpcoming(upcomingRes.data.upcoming || []);
            setOverdue(upcomingRes.data.overdue || []);
        } catch {
            setToast({ message: "Failed to load filings", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [filterType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await filingsAPI.create(form);
            setToast({ message: "Filing record created!", type: "success" });
            setShowModal(false);
            loadData();
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed", type: "error" });
        }
    };

    const markFiled = async (id) => {
        try {
            await filingsAPI.update(id, {
                status: "filed",
                filing_date: new Date().toISOString().split("T")[0],
            });
            setToast({ message: "Marked as filed!", type: "success" });
            loadData();
        } catch {
            setToast({ message: "Update failed", type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this filing record?")) return;
        try {
            await filingsAPI.delete(id);
            setToast({ message: "Deleted", type: "success" });
            loadData();
        } catch {
            setToast({ message: "Delete failed", type: "error" });
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            filed: <span className="status-badge paid">✅ Filed</span>,
            pending: <span className="status-badge unpaid">⏳ Pending</span>,
            draft: <span className="status-badge partial">📝 Draft</span>,
            late: <span className="status-badge overdue">⚠️ Late</span>,
        };
        return map[status] || <span className="status-badge">{status}</span>;
    };

    const daysDiff = (dateStr) => {
        const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page filing-records-page">
            <div className="page-header">
                <h1>📋 Filing Records</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Filing</button>
            </div>

            {/* Overdue Alerts */}
            {overdue.length > 0 && (
                <div className="overdue-alert glass-card">
                    <h3>⚠️ Overdue Filings ({overdue.length})</h3>
                    <div className="overdue-list">
                        {overdue.map(f => (
                            <div key={f.id} className="overdue-item">
                                <span className="code-badge">{f.return_type}</span>
                                <span>{f.period}</span>
                                <span className="overdue-date">Due: {f.due_date}</span>
                                <button className="btn btn-sm btn-primary" onClick={() => markFiled(f.id)}>Mark Filed</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Deadlines */}
            {upcoming.length > 0 && (
                <div className="upcoming-section glass-card">
                    <h3>📅 Upcoming Deadlines</h3>
                    <div className="upcoming-list">
                        {upcoming.slice(0, 5).map(f => {
                            const days = daysDiff(f.due_date);
                            return (
                                <div key={f.id} className="upcoming-item">
                                    <span className="code-badge">{f.return_type}</span>
                                    <span>{f.period}</span>
                                    <span className={`countdown ${days <= 3 ? "urgent" : days <= 7 ? "warning" : ""}`}>
                                        {days} day{days !== 1 ? "s" : ""} left
                                    </span>
                                    <span className="due-date">{f.due_date}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filing Type Info Cards */}
            <div className="filing-info-cards">
                {RETURN_TYPES.map(rt => (
                    <div key={rt} className="filing-info-card glass-card" onClick={() => setFilterType(filterType === rt ? "" : rt)}>
                        <span className={`code-badge ${filterType === rt ? "active" : ""}`}>{rt}</span>
                        <span className="fi-desc">{RETURN_INFO[rt].desc}</span>
                        <span className="fi-freq">{RETURN_INFO[rt].freq} • Due {RETURN_INFO[rt].day}th</span>
                    </div>
                ))}
            </div>

            {/* Filings Table */}
            {filings.length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">📋</span>
                    <h3>No filing records</h3>
                    <p>Track your GST return filings here</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add First Filing</button>
                </div>
            ) : (
                <div className="table-wrapper glass-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Return Type</th>
                                <th>Period</th>
                                <th>FY</th>
                                <th>Due Date</th>
                                <th>Filed Date</th>
                                <th>Liability</th>
                                <th>ITC Claimed</th>
                                <th>Tax Paid</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filings.map(f => (
                                <tr key={f.id}>
                                    <td><span className="code-badge">{f.return_type}</span></td>
                                    <td>{f.period}</td>
                                    <td>{f.financial_year}</td>
                                    <td>{f.due_date}</td>
                                    <td>{f.filing_date || "—"}</td>
                                    <td>₹{Number(f.total_liability).toLocaleString("en-IN")}</td>
                                    <td>₹{Number(f.itc_claimed).toLocaleString("en-IN")}</td>
                                    <td>₹{Number(f.tax_paid).toLocaleString("en-IN")}</td>
                                    <td>{getStatusBadge(f.status)}</td>
                                    <td className="actions-cell">
                                        {f.status !== "filed" && (
                                            <button className="btn-icon" title="Mark Filed" onClick={() => markFiled(f.id)}>✅</button>
                                        )}
                                        <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(f.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Filing Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal glass-card modal-large">
                        <h2>📝 Add Filing Record</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="calc-grid">
                                <div className="form-group">
                                    <label>Return Type *</label>
                                    <select className="input" value={form.return_type}
                                        onChange={e => setForm(f => ({ ...f, return_type: e.target.value }))}>
                                        {RETURN_TYPES.map(rt => <option key={rt} value={rt}>{rt} — {RETURN_INFO[rt].desc}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Period *</label>
                                    <input type="text" className="input" placeholder="e.g., Mar 2026" required
                                        value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Financial Year *</label>
                                    <select className="input" value={form.financial_year}
                                        onChange={e => setForm(f => ({ ...f, financial_year: e.target.value }))}>
                                        <option value="2024-25">2024-25</option>
                                        <option value="2025-26">2025-26</option>
                                        <option value="2026-27">2026-27</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Due Date *</label>
                                    <input type="date" className="input" required value={form.due_date}
                                        onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Total Liability (₹)</label>
                                    <input type="number" className="input" value={form.total_liability}
                                        onChange={e => setForm(f => ({ ...f, total_liability: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>ITC Claimed (₹)</label>
                                    <input type="number" className="input" value={form.itc_claimed}
                                        onChange={e => setForm(f => ({ ...f, itc_claimed: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Tax Paid (₹)</label>
                                    <input type="number" className="input" value={form.tax_paid}
                                        onChange={e => setForm(f => ({ ...f, tax_paid: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>ARN Number</label>
                                    <input type="text" className="input" value={form.arn_number}
                                        onChange={e => setForm(f => ({ ...f, arn_number: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: "1rem" }}>
                                <label>Notes</label>
                                <textarea className="input" rows="2" value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Filing</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
