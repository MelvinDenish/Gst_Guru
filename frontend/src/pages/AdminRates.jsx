import { useState, useEffect } from "react";
import { adminAPI } from "../api";
import Toast from "../components/Toast";

export default function AdminRates() {
    const [rates, setRates] = useState([]);
    const [pg, setPg] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ hsn_sac_code: "", description: "", rate_percent: "", cess_percent: "0", effective_from: new Date().toISOString().split("T")[0], effective_to: "" });
    const [toast, setToast] = useState(null);
    const [sHSN, setSHSN] = useState("");

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p, limit: 20 };
            if (sHSN) params.hsn = sHSN;
            const { data } = await adminAPI.listRates(params);
            setRates(data.rates || []); setPg(data.pagination || { page: 1, totalPages: 1 });
        } catch { } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm({ hsn_sac_code: "", description: "", rate_percent: "", cess_percent: "0", effective_from: new Date().toISOString().split("T")[0], effective_to: "" }); setShowModal(true); };
    const openEdit = (r) => { setEditing(r); setForm({ hsn_sac_code: r.hsn_sac_code, description: r.description, rate_percent: r.rate_percent, cess_percent: r.cess_percent || "0", effective_from: r.effective_from, effective_to: r.effective_to || "" }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await adminAPI.updateRate(editing.id, form); setToast({ message: "Rate updated!", type: "success" }); }
            else { await adminAPI.createRate(form); setToast({ message: "Rate created!", type: "success" }); }
            setShowModal(false); load();
        } catch (err) { setToast({ message: err.response?.data?.error || "Failed", type: "error" }); }
    };

    const handleDelete = async (id) => { if (!confirm("Deactivate?")) return; try { await adminAPI.deleteRate(id); setToast({ message: "Rate deactivated", type: "success" }); load(); } catch { } };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]; if (!file) return;
        try { const fd = new FormData(); fd.append("file", file); const { data } = await adminAPI.bulkUpload(fd); setToast({ message: data.message, type: "success" }); load(); }
        catch (err) { setToast({ message: err.response?.data?.error || "Upload failed", type: "error" }); }
        e.target.value = "";
    };

    return (
        <div className="page admin-rates-page">
            <div className="page-header">
                <h1>⚙️ Rate Management</h1>
                <div className="page-actions">
                    <label className="btn btn-secondary upload-btn">📤 CSV Upload<input type="file" accept=".csv" onChange={handleUpload} hidden /></label>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Rate</button>
                </div>
            </div>
            <div className="admin-search glass-card">
                <input className="input" placeholder="Search HSN..." value={sHSN} onChange={e => setSHSN(e.target.value)} />
                <button className="btn btn-primary" onClick={() => load(1)}>Search</button>
            </div>
            {loading ? <div className="loading-spinner" /> : (
                <>
                    <div className="table-wrapper glass-card">
                        <table className="data-table"><thead><tr><th>HSN</th><th>Description</th><th>Rate</th><th>Cess</th><th>From</th><th>To</th><th>Category</th><th>Actions</th></tr></thead>
                            <tbody>{rates.map(r => <tr key={r.id}><td><span className="code-badge">{r.hsn_sac_code}</span></td><td className="desc-cell">{r.description}</td><td><span className={`slab-badge slab-badge-${r.rate_percent}`}>{r.rate_percent}%</span></td><td>{r.cess_percent || 0}%</td><td>{r.effective_from}</td><td>{r.effective_to || "Active"}</td><td>{r.Category?.name || "—"}</td><td className="actions-cell"><button className="btn-icon edit" onClick={() => openEdit(r)}>✏️</button><button className="btn-icon delete" onClick={() => handleDelete(r.id)}>🗑️</button></td></tr>)}</tbody>
                        </table>
                    </div>
                    {pg.totalPages > 1 && <div className="pagination"><button className="btn btn-sm" disabled={pg.page <= 1} onClick={() => load(pg.page - 1)}>← Prev</button><span className="page-info">Page {pg.page}/{pg.totalPages}</span><button className="btn btn-sm" disabled={pg.page >= pg.totalPages} onClick={() => load(pg.page + 1)}>Next →</button></div>}
                </>
            )}
            {showModal && <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}><div className="modal glass-card"><h2>{editing ? "Edit Rate" : "Add Rate"}</h2><form onSubmit={handleSubmit}><div className="form-row"><div className="form-group"><label>HSN *</label><input className="input" value={form.hsn_sac_code} onChange={e => setForm({ ...form, hsn_sac_code: e.target.value })} required /></div><div className="form-group"><label>Rate % *</label><input type="number" className="input" value={form.rate_percent} onChange={e => setForm({ ...form, rate_percent: e.target.value })} required step="0.01" /></div></div><div className="form-group"><label>Description *</label><input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div><div className="form-row"><div className="form-group"><label>Cess%</label><input type="number" className="input" value={form.cess_percent} onChange={e => setForm({ ...form, cess_percent: e.target.value })} step="0.01" /></div><div className="form-group"><label>From *</label><input type="date" className="input" value={form.effective_from} onChange={e => setForm({ ...form, effective_from: e.target.value })} required /></div><div className="form-group"><label>To</label><input type="date" className="input" value={form.effective_to} onChange={e => setForm({ ...form, effective_to: e.target.value })} /></div></div><div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? "Update" : "Create"}</button></div></form></div></div>}
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
