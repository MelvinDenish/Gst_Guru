import { useState, useEffect } from "react";
import { adminAPI } from "../api";
import Toast from "../components/Toast";

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", parent_id: "", hsn_sac_range: "" });
    const [toast, setToast] = useState(null);

    const load = async () => {
        try { const { data } = await adminAPI.listCategories(); setCategories(data.categories || []); }
        catch { } finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => { setEditing(null); setForm({ name: "", parent_id: "", hsn_sac_range: "" }); setShowModal(true); };
    const openEdit = (c) => { setEditing(c); setForm({ name: c.name, parent_id: c.parent_id || "", hsn_sac_range: c.hsn_sac_range || "" }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await adminAPI.updateCategory(editing.id, form); setToast({ message: "Updated!", type: "success" }); }
            else { await adminAPI.createCategory(form); setToast({ message: "Created!", type: "success" }); }
            setShowModal(false); load();
        } catch (err) { setToast({ message: err.response?.data?.error || "Failed", type: "error" }); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete category?")) return;
        try { await adminAPI.deleteCategory(id); setToast({ message: "Deleted", type: "success" }); load(); }
        catch { setToast({ message: "Failed", type: "error" }); }
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page admin-categories-page">
            <div className="page-header">
                <h1>📂 Category Management</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
            </div>
            <div className="categories-grid">
                {categories.map((c) => (
                    <div key={c.id} className="category-card glass-card">
                        <div className="cat-header">
                            <h3>{c.name}</h3>
                            <div className="actions-cell">
                                <button className="btn-icon edit" onClick={() => openEdit(c)}>✏️</button>
                                <button className="btn-icon delete" onClick={() => handleDelete(c.id)}>🗑️</button>
                            </div>
                        </div>
                        {c.hsn_sac_range && <span className="cat-range">HSN: {c.hsn_sac_range}</span>}
                        {c.children?.length > 0 && (
                            <div className="sub-cats">
                                {c.children.map((sc) => (
                                    <span key={sc.id} className="sub-cat-tag">{sc.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal glass-card">
                        <h2>{editing ? "Edit Category" : "Add Category"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label>Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                            <div className="form-group"><label>HSN/SAC Range</label><input className="input" placeholder="e.g., 0100-2400" value={form.hsn_sac_range} onChange={(e) => setForm({ ...form, hsn_sac_range: e.target.value })} /></div>
                            <div className="form-group"><label>Parent Category</label>
                                <select className="input" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                                    <option value="">None (Top Level)</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
