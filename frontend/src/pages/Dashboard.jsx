import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { calculationsAPI, productsAPI, notificationsAPI } from "../api";

export default function Dashboard() {
    const { user } = useAuth();
    const [recentCalcs, setRecentCalcs] = useState([]);
    const [products, setProducts] = useState([]);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [calcsRes, prodsRes, notifsRes] = await Promise.all([
                    calculationsAPI.history({ page: 1, limit: 5 }),
                    productsAPI.list(),
                    notificationsAPI.list(),
                ]);
                setRecentCalcs(calcsRes.data.calculations || []);
                setProducts(prodsRes.data.products || []);
                setUnreadNotifs(notifsRes.data.unreadCount || 0);
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="page"><div className="loading-spinner"></div></div>;

    return (
        <div className="page dashboard-page">
            <div className="page-header">
                <h1>Welcome, <span className="gradient-text">{user?.name}</span></h1>
                <p className="subtitle">{user?.business_name || "Business Dashboard"} {user?.gstin ? `• GSTIN: ${user.gstin}` : ""}</p>
            </div>

            {/* Quick Stats */}
            <div className="dashboard-stats">
                <div className="stat-card glass-card">
                    <span className="stat-icon">🧮</span>
                    <span className="stat-value">{recentCalcs.length}</span>
                    <span className="stat-label">Recent Calculations</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">📦</span>
                    <span className="stat-value">{products.length}</span>
                    <span className="stat-label">Products</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">🔔</span>
                    <span className="stat-value">{unreadNotifs}</span>
                    <span className="stat-label">Unread Notifications</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/" className="action-card glass-card">
                    <span className="action-icon">⚡</span>
                    <span>New Calculation</span>
                </Link>
                <Link to="/products" className="action-card glass-card">
                    <span className="action-icon">➕</span>
                    <span>Add Product</span>
                </Link>
                <Link to="/history" className="action-card glass-card">
                    <span className="action-icon">📋</span>
                    <span>View History</span>
                </Link>
                <Link to="/notifications" className="action-card glass-card">
                    <span className="action-icon">🔔</span>
                    <span>Notifications</span>
                </Link>
            </div>

            {/* Recent Calculations */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Calculations</h2>
                    <Link to="/history" className="link-btn">View All →</Link>
                </div>
                {recentCalcs.length === 0 ? (
                    <div className="empty-state glass-card">
                        <p>No calculations yet. <Link to="/">Make your first calculation →</Link></p>
                    </div>
                ) : (
                    <div className="table-wrapper glass-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>HSN/SAC</th>
                                    <th>Amount</th>
                                    <th>Rate</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCalcs.map((c) => (
                                    <tr key={c.id}>
                                        <td>{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                                        <td><span className="code-badge">{c.hsn_sac_code}</span></td>
                                        <td>₹{Number(c.taxable_value).toLocaleString("en-IN")}</td>
                                        <td><span className={`slab-badge slab-badge-${c.rate_used}`}>{c.rate_used}%</span></td>
                                        <td className="total-cell">₹{Number(c.total).toLocaleString("en-IN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Products Preview */}
            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Your Products</h2>
                    <Link to="/products" className="link-btn">Manage →</Link>
                </div>
                {products.length === 0 ? (
                    <div className="empty-state glass-card">
                        <p>No products added. <Link to="/products">Add your first product →</Link></p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.slice(0, 6).map((p) => (
                            <div key={p.id} className="product-card glass-card">
                                <span className="code-badge">{p.hsn_sac_code}</span>
                                <p className="product-desc">{p.description}</p>
                                <span className={`slab-badge slab-badge-${p.current_rate}`}>GST {p.current_rate ?? "?"}%</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
