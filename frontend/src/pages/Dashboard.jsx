import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { calculationsAPI, productsAPI, notificationsAPI, invoicesAPI, filingsAPI } from "../api";

export default function Dashboard() {
    const { user } = useAuth();
    const [recentCalcs, setRecentCalcs] = useState([]);
    const [products, setProducts] = useState([]);
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [invoiceStats, setInvoiceStats] = useState(null);
    const [upcomingFilings, setUpcomingFilings] = useState([]);
    const [overdueFilings, setOverdueFilings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [calcsRes, prodsRes, notifsRes, invStatsRes, filingsRes] = await Promise.all([
                    calculationsAPI.history({ page: 1, limit: 5 }),
                    productsAPI.list(),
                    notificationsAPI.list(),
                    invoicesAPI.stats().catch(() => ({ data: {} })),
                    filingsAPI.upcoming().catch(() => ({ data: { upcoming: [], overdue: [] } })),
                ]);
                setRecentCalcs(calcsRes.data.calculations || []);
                setProducts(prodsRes.data.products || []);
                setUnreadNotifs(notifsRes.data.unreadCount || 0);
                setInvoiceStats(invStatsRes.data);
                setUpcomingFilings(filingsRes.data.upcoming || []);
                setOverdueFilings(filingsRes.data.overdue || []);
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
                    <span className="stat-icon">🧾</span>
                    <span className="stat-value">{invoiceStats?.total || 0}</span>
                    <span className="stat-label">Total Invoices</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">💰</span>
                    <span className="stat-value">₹{Number(invoiceStats?.totalOutstanding || 0).toLocaleString("en-IN")}</span>
                    <span className="stat-label">Outstanding</span>
                </div>
                <div className="stat-card glass-card">
                    <span className="stat-icon">⚠️</span>
                    <span className="stat-value">{overdueFilings.length}</span>
                    <span className="stat-label">Overdue Filings</span>
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
                <Link to="/gst-lookup" className="action-card glass-card">
                    <span className="action-icon">🤖</span>
                    <span>AI GST Lookup</span>
                </Link>
                <Link to="/invoices" className="action-card glass-card">
                    <span className="action-icon">🧾</span>
                    <span>Create Invoice</span>
                </Link>
                <Link to="/filings" className="action-card glass-card">
                    <span className="action-icon">📋</span>
                    <span>Filing Records</span>
                </Link>
                <Link to="/compliance" className="action-card glass-card">
                    <span className="action-icon">📊</span>
                    <span>Compliance</span>
                </Link>
                <Link to="/products" className="action-card glass-card">
                    <span className="action-icon">➕</span>
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Overdue Filings Alert */}
            {overdueFilings.length > 0 && (
                <div className="overdue-alert glass-card">
                    <h3>⚠️ Overdue Filings</h3>
                    <div className="overdue-list">
                        {overdueFilings.map(f => (
                            <div key={f.id} className="overdue-item">
                                <span className="code-badge">{f.return_type}</span>
                                <span>{f.period}</span>
                                <span className="overdue-date">Due: {f.due_date}</span>
                            </div>
                        ))}
                    </div>
                    <Link to="/filings" className="link-btn">Manage Filings →</Link>
                </div>
            )}

            {/* Upcoming Deadlines */}
            {upcomingFilings.length > 0 && (
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>📅 Upcoming Deadlines</h2>
                        <Link to="/filings" className="link-btn">View All →</Link>
                    </div>
                    <div className="upcoming-list glass-card">
                        {upcomingFilings.slice(0, 3).map(f => {
                            const days = Math.ceil((new Date(f.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                            return (
                                <div key={f.id} className="upcoming-item">
                                    <span className="code-badge">{f.return_type}</span>
                                    <span>{f.period}</span>
                                    <span className={`countdown ${days <= 3 ? "urgent" : days <= 7 ? "warning" : ""}`}>
                                        {days} day{days !== 1 ? "s" : ""} left
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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
