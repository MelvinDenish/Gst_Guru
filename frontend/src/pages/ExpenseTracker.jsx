import { useState, useEffect } from "react";
import { expensesAPI, itcAPI } from "../api";

export default function ExpenseTracker() {
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        vendor_name: "", vendor_gstin: "", category: "Office Supplies",
        amount: "", gst_paid: "", date: new Date().toISOString().split('T')[0],
        eligible_itc: true, notes: ""
    });

    const categories = ["Office Supplies", "Rent", "Utilities", "Travel", "Software", "Marketing", "Other"];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expRes, sumRes] = await Promise.all([
                expensesAPI.list(),
                expensesAPI.summary()
            ]);
            setExpenses(expRes.data);
            setSummary(sumRes.data);
        } catch (err) {
            setError("Failed to load expenses");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await expensesAPI.create(formData);
            setShowForm(false);
            setFormData({
                vendor_name: "", vendor_gstin: "", category: "Office Supplies",
                amount: "", gst_paid: "", date: new Date().toISOString().split('T')[0],
                eligible_itc: true, notes: ""
            });
            loadData();
        } catch (err) {
            setError("Failed to save expense");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this expense?")) return;
        try {
            await expensesAPI.delete(id);
            loadData();
        } catch (err) {
            setError("Failed to delete expense");
        }
    };

    if (loading) return <div className="page"><div className="card"><p>Loading...</p></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2>Expense Tracker</h2>
                    <p className="text-muted">Track business expenses and calculate eligible ITC.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Expense"}
                </button>
            </div>

            {error && <div className="error-card">{error}</div>}

            {summary && (
                <div className="stats-grid mb-2">
                    <div className="stat-card">
                        <h3>Total Expenses</h3>
                        <div className="stat-value">₹{(summary.totalAmount || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Total GST Paid</h3>
                        <div className="stat-value">₹{(summary.totalGst || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-card success">
                        <h3>Eligible ITC</h3>
                        <div className="stat-value">₹{(summary.eligibleItc || 0).toLocaleString()}</div>
                        <p className="stat-desc">Can be claimed against liability</p>
                    </div>
                </div>
            )}

            {showForm && (
                <div className="card mb-2 form-card">
                    <h3>Add New Expense</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" className="input" required
                                    value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Vendor Name</label>
                                <input type="text" className="input" required placeholder="Vendor"
                                    value={formData.vendor_name} onChange={e => setFormData({ ...formData, vendor_name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Vendor GSTIN (Optional)</label>
                                <input type="text" className="input" placeholder="22AAAAA0000A1Z5"
                                    value={formData.vendor_gstin} onChange={e => setFormData({ ...formData, vendor_gstin: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount (Excl. GST)</label>
                                <input type="number" step="0.01" className="input" required placeholder="0.00"
                                    value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>GST Paid</label>
                                <input type="number" step="0.01" className="input" required placeholder="0.00"
                                    value={formData.gst_paid} onChange={e => setFormData({ ...formData, gst_paid: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="itc" checked={formData.eligible_itc} 
                                onChange={e => setFormData({...formData, eligible_itc: e.target.checked})} />
                            <label htmlFor="itc" style={{ margin: 0, textTransform: 'none', cursor: 'pointer' }}>
                                This expense is eligible for Input Tax Credit (ITC)
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Notes</label>
                            <input type="text" className="input" placeholder="Optional details..."
                                value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                        </div>

                        <button type="submit" className="btn btn-primary">Save Expense</button>
                    </form>
                </div>
            )}

            <div className="card">
                <h3>Recent Expenses</h3>
                {expenses.length === 0 ? (
                    <p className="text-muted">No expenses recorded yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vendor</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>GST Paid</th>
                                    <th>ITC</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(exp => (
                                    <tr key={exp.id}>
                                        <td>{exp.date}</td>
                                        <td>
                                            <div>{exp.vendor_name}</div>
                                            {exp.vendor_gstin && <small className="text-muted">{exp.vendor_gstin}</small>}
                                        </td>
                                        <td>{exp.category}</td>
                                        <td>₹{Number(exp.amount).toFixed(2)}</td>
                                        <td>₹{Number(exp.gst_paid).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${exp.eligible_itc ? 'badge-success' : 'badge-danger'}`}>
                                                {exp.eligible_itc ? 'Eligible' : 'Not Eligible'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(exp.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
