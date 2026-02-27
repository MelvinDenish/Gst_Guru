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

    // Sync state
    const [syncStatus, setSyncStatus] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [showSyncLogs, setShowSyncLogs] = useState(false);
    const [syncLogs, setSyncLogs] = useState([]);

    const load = async (p = 1) => {
        setLoading(true);
        try {
            const params = { page: p, limit: 20 };
            if (sHSN) params.hsn = sHSN;
            const { data } = await adminAPI.listRates(params);
            setRates(data.rates || []); setPg(data.pagination || { page: 1, totalPages: 1 });
        } catch { } finally { setLoading(false); }
    };

    const loadSyncStatus = async () => {
        try { const { data } = await adminAPI.syncStatus(); setSyncStatus(data); }
        catch { }
    };

    useEffect(() => { load(); loadSyncStatus(); }, []);

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

    const handleSync = async () => {
        setSyncing(true);
        try {
            const { data } = await adminAPI.triggerSync();
            setToast({ message: `Sync complete: ${data.result?.totalUpdated || 0} updated, ${data.result?.totalAdded || 0} added`, type: "success" });
            load();
            loadSyncStatus();
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Sync failed", type: "error" });
        } finally { setSyncing(false); }
    };

    const loadSyncLogs = async () => {
        try {
            const { data } = await adminAPI.syncLogs({ page: 1, limit: 10 });
            setSyncLogs(data.logs || []);
            setShowSyncLogs(true);
        } catch { }
    };

    const formatTime = (d) => d ? new Date(d).toLocaleString("en-IN") : "—";
    const statusColor = (s) => s === "success" ? "#22c55e" : s === "failed" ? "#ef4444" : s === "partial" ? "#f59e0b" : "#3b82f6";

    return (
        <div className="page admin-rates-page">
            <div className="page-header">
                <h1>⚙️ Rate Management</h1>
                <div className="page-actions">
                    <label className="btn btn-secondary upload-btn">📤 CSV Upload<input type="file" accept=".csv" onChange={handleUpload} hidden /></label>
                    <button className="btn btn-primary" onClick={openAdd}>+ Add Rate</button>
                </div>
            </div>

            {/* ═══ Sync Status Widget ═══ */}
            <div className="sync-widget glass-card">
                <div className="sync-header">
                    <div className="sync-info">
                        <h3>🔄 Auto-Sync Status</h3>
                        {syncStatus?.scheduler && (
                            <span className={`sync-badge ${syncStatus.scheduler.enabled ? "enabled" : "disabled"}`}>
                                {syncStatus.scheduler.enabled ? "Enabled" : "Disabled"} — {syncStatus.scheduler.cronExpression}
                            </span>
                        )}
                    </div>
                    <div className="sync-actions">
                        <button className="btn btn-sm btn-secondary" onClick={loadSyncLogs}>📋 Logs</button>
                        <button className="btn btn-sm btn-primary" onClick={handleSync} disabled={syncing}>
                            {syncing ? <><span className="spinner"></span> Syncing...</> : "⚡ Sync Now"}
                        </button>
                    </div>
                </div>

                {syncStatus?.lastSync && (
                    <div className="sync-details">
                        <div className="sync-detail">
                            <span className="sync-label">Last Sync</span>
                            <span>{formatTime(syncStatus.lastSync.started_at)}</span>
                        </div>
                        <div className="sync-detail">
                            <span className="sync-label">Source</span>
                            <span className="code-badge">{syncStatus.lastSync.source}</span>
                        </div>
                        <div className="sync-detail">
                            <span className="sync-label">Status</span>
                            <span style={{ color: statusColor(syncStatus.lastSync.status), fontWeight: 600 }}>
                                {syncStatus.lastSync.status?.toUpperCase()}
                            </span>
                        </div>
                        <div className="sync-detail">
                            <span className="sync-label">Checked</span>
                            <span>{syncStatus.lastSync.rates_checked}</span>
                        </div>
                        <div className="sync-detail">
                            <span className="sync-label">Updated</span>
                            <span style={{ color: syncStatus.lastSync.rates_updated > 0 ? "#22c55e" : "inherit", fontWeight: 600 }}>
                                {syncStatus.lastSync.rates_updated}
                            </span>
                        </div>
                        <div className="sync-detail">
                            <span className="sync-label">Added</span>
                            <span>{syncStatus.lastSync.rates_added}</span>
                        </div>
                    </div>
                )}

                {!syncStatus?.lastSync && (
                    <p className="sync-empty">No sync has run yet. Click "Sync Now" to fetch latest rates.</p>
                )}
            </div>

            {/* Sync Logs Modal */}
            {showSyncLogs && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowSyncLogs(false)}>
                    <div className="modal glass-card" style={{ maxWidth: "700px" }}>
                        <h2>📋 Sync History</h2>
                        {syncLogs.length === 0 ? <p>No sync logs yet.</p> : (
                            <div className="table-wrapper" style={{ padding: 0 }}>
                                <table className="data-table">
                                    <thead><tr><th>Time</th><th>Source</th><th>Status</th><th>Checked</th><th>Updated</th><th>Added</th><th>Errors</th></tr></thead>
                                    <tbody>
                                        {syncLogs.map(l => (
                                            <tr key={l.id}>
                                                <td>{formatTime(l.started_at)}</td>
                                                <td><span className="code-badge">{l.source}</span></td>
                                                <td style={{ color: statusColor(l.status), fontWeight: 600 }}>{l.status}</td>
                                                <td>{l.rates_checked}</td>
                                                <td>{l.rates_updated}</td>
                                                <td>{l.rates_added}</td>
                                                <td>{l.errors}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowSyncLogs(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

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
