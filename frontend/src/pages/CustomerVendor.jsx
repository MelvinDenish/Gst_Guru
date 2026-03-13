import { useState, useEffect } from "react";
import { partiesAPI } from "../api";

export default function CustomerVendor() {
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterType, setFilterType] = useState("");
    
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "", type: "customer", gstin: "", address: "", phone: "", email: ""
    });

    useEffect(() => {
        loadData();
    }, [filterType]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await partiesAPI.list(filterType || undefined);
            setParties(res.data);
        } catch (err) {
            setError("Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await partiesAPI.create(formData);
            setShowForm(false);
            setFormData({ name: "", type: "customer", gstin: "", address: "", phone: "", email: "" });
            loadData();
        } catch (err) {
            setError("Failed to save contact");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this contact?")) return;
        try {
            await partiesAPI.delete(id);
            loadData();
        } catch (err) {
            setError("Failed to delete contact");
        }
    };

    if (loading && parties.length === 0) return <div className="page"><div className="card"><p>Loading...</p></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>Customers & Vendors</h2>
                    <p className="text-muted">Manage your business contacts for faster invoicing.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Contact"}
                </button>
            </div>

            {error && <div className="error-card">{error}</div>}

            <div className="filter-row mb-2">
                <div className="filter-group">
                    <label>Filter by Type:</label>
                    <select className="input" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Contacts</option>
                        <option value="customer">Customers Only</option>
                        <option value="vendor">Vendors Only</option>
                    </select>
                </div>
            </div>

            {showForm && (
                <div className="card mb-2 form-card">
                    <h3>Add New Contact</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" className="input" required placeholder="Business or Person Name"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select className="input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="both">Both</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>GSTIN (Optional)</label>
                                <input type="text" className="input" placeholder="22AAAAA0000A1Z5"
                                    value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" className="input" placeholder="Phone Number"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" className="input" placeholder="contact@example.com"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Address</label>
                            <textarea className="input" placeholder="Full Address..." rows="2"
                                value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary">Save Contact</button>
                    </form>
                </div>
            )}

            <div className="card">
                <div className="table-wrapper">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>GSTIN</th>
                                <th>Contact Info</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parties.length === 0 ? (
                                <tr><td colSpan="5" className="text-center">No contacts found.</td></tr>
                            ) : (
                                parties.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>
                                            <span className={`badge ${p.type === 'customer' ? 'badge-primary' : p.type === 'vendor' ? 'badge-warning' : 'badge-success'}`}>
                                                {p.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{p.gstin || <span className="text-muted">N/A</span>}</td>
                                        <td>
                                            {p.email && <div>✉️ {p.email}</div>}
                                            {p.phone && <div>📞 {p.phone}</div>}
                                        </td>
                                        <td>
                                            <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(p.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
