import { useState, useEffect } from "react";
import { productsAPI } from "../api";
import Toast from "../components/Toast";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ hsn_sac_code: "", description: "", default_rate: "" });
    const [toast, setToast] = useState(null);

    const loadProducts = async () => {
        try {
            const { data } = await productsAPI.list();
            setProducts(data.products || []);
        } catch { setToast({ message: "Failed to load products", type: "error" }); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadProducts(); }, []);

    const openAdd = () => { setEditing(null); setForm({ hsn_sac_code: "", description: "", default_rate: "" }); setShowModal(true); };
    const openEdit = (p) => { setEditing(p); setForm({ hsn_sac_code: p.hsn_sac_code, description: p.description, default_rate: p.default_rate || "" }); setShowModal(true); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await productsAPI.update(editing.id, form);
                setToast({ message: "Product updated!", type: "success" });
            } else {
                await productsAPI.create(form);
                setToast({ message: "Product added!", type: "success" });
            }
            setShowModal(false);
            loadProducts();
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Failed", type: "error" });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await productsAPI.delete(id);
            setToast({ message: "Product deleted", type: "success" });
            loadProducts();
        } catch { setToast({ message: "Delete failed", type: "error" }); }
    };

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page products-page">
            <div className="page-header">
                <h1>📦 Product Management</h1>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
            </div>

            {products.length === 0 ? (
                <div className="empty-state glass-card">
                    <span className="empty-icon">📦</span>
                    <h3>No products yet</h3>
                    <p>Add products from your catalog to track their GST rates</p>
                    <button className="btn btn-primary" onClick={openAdd}>Add First Product</button>
                </div>
            ) : (
                <div className="table-wrapper glass-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>HSN/SAC</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Current Rate</th>
                                <th>Cess</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id}>
                                    <td><span className="code-badge">{p.hsn_sac_code}</span></td>
                                    <td>{p.description}</td>
                                    <td>{p.category || "—"}</td>
                                    <td><span className={`slab-badge slab-badge-${p.current_rate}`}>{p.current_rate ?? "N/A"}%</span></td>
                                    <td>{p.current_cess || 0}%</td>
                                    <td className="actions-cell">
                                        <button className="btn-icon edit" onClick={() => openEdit(p)} title="Edit">✏️</button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(p.id)} title="Delete">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal glass-card">
                        <h2>{editing ? "Edit Product" : "Add Product"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>HSN/SAC Code *</label>
                                <input type="text" className="input" placeholder="e.g., 8517" value={form.hsn_sac_code}
                                    onChange={(e) => setForm({ ...form, hsn_sac_code: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <input type="text" className="input" placeholder="e.g., Mobile Phones" value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Default Rate Override (%)</label>
                                <input type="number" className="input" placeholder="Optional" value={form.default_rate}
                                    onChange={(e) => setForm({ ...form, default_rate: e.target.value })} step="0.01" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
