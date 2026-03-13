import { useState, useEffect } from "react";
import { invoicesAPI } from "../api";
import { INDIAN_STATES } from "../utils/constants";
import Toast from "../components/Toast";

export default function InvoiceTracker() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState("all");
    const [toast, setToast] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    const [form, setForm] = useState({
        invoice_type: "sale", buyer_name: "", buyer_gstin: "", buyer_address: "",
        seller_name: "", seller_gstin: "", invoice_date: new Date().toISOString().split("T")[0],
        due_date: "", place_of_supply: "27", place_of_delivery: "27", notes: "",
        items: [{ description: "", hsn_code: "", price: "", quantity: "1", gst_rate: "18", cess_rate: "0" }],
    });

    const loadInvoices = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (filter !== "all") params.status = filter;
            const [invRes, statsRes] = await Promise.all([
                invoicesAPI.list(params),
                invoicesAPI.stats(),
            ]);
            setInvoices(invRes.data.invoices || []);
            setPagination(invRes.data.pagination || { page: 1, totalPages: 1 });
            setStats(statsRes.data);
        } catch (err) {
            setToast({ message: "Failed to load invoices", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadInvoices(); }, [filter]);

    const addItem = () => {
        setForm(f => ({
            ...f,
            items: [...f.items, { description: "", hsn_code: "", price: "", quantity: "1", gst_rate: "18", cess_rate: "0" }],
        }));
    };

    const updateItem = (idx, field, value) => {
        setForm(f => {
            const items = [...f.items];
            items[idx] = { ...items[idx], [field]: value };
            return { ...f, items };
        });
    };

    const removeItem = (idx) => {
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
    };

    const calcLineTotal = (item) => {
        const base = (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
        const gst = (base * (parseFloat(item.gst_rate) || 0)) / 100;
        return (base + gst).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await invoicesAPI.create(form);
            setToast({ message: "Invoice created!", type: "success" });
            setShowModal(false);
            resetForm();
            loadInvoices();
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed", type: "error" });
        }
    };

    const resetForm = () => {
        setForm({
            invoice_type: "sale", buyer_name: "", buyer_gstin: "", buyer_address: "",
            seller_name: "", seller_gstin: "", invoice_date: new Date().toISOString().split("T")[0],
            due_date: "", place_of_supply: "27", place_of_delivery: "27", notes: "",
            items: [{ description: "", hsn_code: "", price: "", quantity: "1", gst_rate: "18", cess_rate: "0" }],
        });
    };

    const toggleStatus = async (inv, newStatus) => {
        try {
            await invoicesAPI.updateStatus(inv.id, {
                payment_status: newStatus,
                amount_paid: newStatus === "paid" ? inv.total : 0,
            });
            setToast({ message: `Marked as ${newStatus}`, type: "success" });
            loadInvoices(pagination.page);
        } catch {
            setToast({ message: "Failed to update", type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this invoice?")) return;
        try {
            await invoicesAPI.delete(id);
            setToast({ message: "Invoice deleted", type: "success" });
            loadInvoices();
        } catch {
            setToast({ message: "Delete failed", type: "error" });
        }
    };

    const getStatusBadge = (inv) => {
        const today = new Date().toISOString().split("T")[0];
        if (inv.payment_status === "paid") return <span className="status-badge paid">✅ Paid</span>;
        if (inv.payment_status === "partial") return <span className="status-badge partial">⏳ Partial</span>;
        if (inv.due_date && inv.due_date < today) return <span className="status-badge overdue">⚠️ Overdue</span>;
        return <span className="status-badge unpaid">🔴 Unpaid</span>;
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page invoice-tracker-page">
            <div className="page-header">
                <h1>🧾 Invoice Tracker</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Invoice</button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="dashboard-stats">
                    <div className="stat-card glass-card">
                        <span className="stat-icon">💰</span>
                        <span className="stat-value">₹{Number(stats.totalRevenue || 0).toLocaleString("en-IN")}</span>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">⏳</span>
                        <span className="stat-value">₹{Number(stats.totalOutstanding || 0).toLocaleString("en-IN")}</span>
                        <span className="stat-label">Outstanding</span>
                    </div>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">⚠️</span>
                        <span className="stat-value">{stats.overdueCount || 0}</span>
                        <span className="stat-label">Overdue</span>
                    </div>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">📄</span>
                        <span className="stat-value">{stats.total || 0}</span>
                        <span className="stat-label">Total Invoices</span>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs">
                {["all", "unpaid", "partial", "paid"].map(f => (
                    <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}>
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === "unpaid" && stats ? ` (${stats.unpaidCount || 0})` : ""}
                        {f === "paid" && stats ? ` (${stats.paidCount || 0})` : ""}
                    </button>
                ))}
            </div>

            {/* Invoice Table */}
            {invoices.length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">🧾</span>
                    <h3>No invoices yet</h3>
                    <p>Create your first invoice to start tracking</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Invoice</button>
                </div>
            ) : (
                <>
                    <div className="table-wrapper glass-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Type</th>
                                    <th>Buyer</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th>Subtotal</th>
                                    <th>Tax</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td><span className="code-badge">{inv.invoice_number}</span></td>
                                        <td><span className={`type-badge ${inv.invoice_type}`}>{inv.invoice_type}</span></td>
                                        <td>{inv.buyer_name}</td>
                                        <td>{inv.invoice_date}</td>
                                        <td>{inv.due_date || "—"}</td>
                                        <td>₹{Number(inv.subtotal).toLocaleString("en-IN")}</td>
                                        <td>₹{(Number(inv.cgst) + Number(inv.sgst) + Number(inv.igst)).toLocaleString("en-IN")}</td>
                                        <td className="total-cell">₹{Number(inv.total).toLocaleString("en-IN")}</td>
                                        <td>{getStatusBadge(inv)}</td>
                                        <td className="actions-cell">
                                            {inv.payment_status !== "paid" && (
                                                <button className="btn-icon" title="Mark Paid" onClick={() => toggleStatus(inv, "paid")}>✅</button>
                                            )}
                                            {inv.payment_status === "paid" && (
                                                <button className="btn-icon" title="Mark Unpaid" onClick={() => toggleStatus(inv, "unpaid")}>↩️</button>
                                            )}
                                            <a href={`http://localhost:5000/api/invoices/${inv.id}/pdf`} target="_blank" rel="noreferrer" className="btn-icon" title="Download PDF" style={{textDecoration: 'none'}}>📥</a>
                                            <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(inv.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button className="btn btn-sm" disabled={pagination.page <= 1}
                                onClick={() => loadInvoices(pagination.page - 1)}>← Prev</button>
                            <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
                            <button className="btn btn-sm" disabled={pagination.page >= pagination.totalPages}
                                onClick={() => loadInvoices(pagination.page + 1)}>Next →</button>
                        </div>
                    )}
                </>
            )}

            {/* Create Invoice Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal glass-card modal-large">
                        <h2>📝 Create Invoice</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="calc-grid">
                                <div className="form-group">
                                    <label>Invoice Type</label>
                                    <select className="input" value={form.invoice_type}
                                        onChange={e => setForm(f => ({ ...f, invoice_type: e.target.value }))}>
                                        <option value="sale">Sale</option>
                                        <option value="purchase">Purchase</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Buyer Name *</label>
                                    <input type="text" className="input" required value={form.buyer_name}
                                        onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Buyer GSTIN</label>
                                    <input type="text" className="input" value={form.buyer_gstin}
                                        onChange={e => setForm(f => ({ ...f, buyer_gstin: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Invoice Date</label>
                                    <input type="date" className="input" value={form.invoice_date}
                                        onChange={e => setForm(f => ({ ...f, invoice_date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" className="input" value={form.due_date}
                                        onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Place of Supply</label>
                                    <select className="input" value={form.place_of_supply}
                                        onChange={e => setForm(f => ({ ...f, place_of_supply: e.target.value }))}>
                                        {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Place of Delivery</label>
                                    <select className="input" value={form.place_of_delivery}
                                        onChange={e => setForm(f => ({ ...f, place_of_delivery: e.target.value }))}>
                                        {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <h3 style={{ margin: "1.5rem 0 0.5rem" }}>Line Items</h3>
                            {form.items.map((item, idx) => (
                                <div key={idx} className="eway-item-row">
                                    <input type="text" className="input" placeholder="Description *" required
                                        value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} />
                                    <input type="text" className="input" placeholder="HSN" style={{ width: "100px" }}
                                        value={item.hsn_code} onChange={e => updateItem(idx, "hsn_code", e.target.value)} />
                                    <input type="number" className="input" placeholder="Price *" required style={{ width: "120px" }}
                                        value={item.price} onChange={e => updateItem(idx, "price", e.target.value)} />
                                    <input type="number" className="input" placeholder="Qty" style={{ width: "70px" }}
                                        value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} />
                                    <input type="number" className="input" placeholder="GST%" style={{ width: "75px" }}
                                        value={item.gst_rate} onChange={e => updateItem(idx, "gst_rate", e.target.value)} />
                                    <span className="line-total">₹{calcLineTotal(item)}</span>
                                    {form.items.length > 1 && (
                                        <button type="button" className="btn-icon delete" onClick={() => removeItem(idx)}>🗑️</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="btn btn-secondary" onClick={addItem} style={{ marginTop: "0.5rem" }}>+ Add Item</button>

                            <div className="form-group" style={{ marginTop: "1rem" }}>
                                <label>Notes</label>
                                <textarea className="input" rows="2" value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}></textarea>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Invoice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
