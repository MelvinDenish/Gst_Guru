import { useState, useEffect } from "react";
import { hsnBrowserAPI } from "../api";

export default function HsnBrowser() {
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [rates, setRates] = useState([]);
    const [distribution, setDistribution] = useState({});
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRate, setSelectedRate] = useState("");
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
        loadStats();
    }, []);

    useEffect(() => {
        loadRates();
    }, [selectedCategory, selectedRate, search, pagination.page]);

    const loadCategories = async () => {
        try {
            const res = await hsnBrowserAPI.categories();
            setCategories(res.data.categories || []);
        } catch { /* ignore */ }
    };

    const loadStats = async () => {
        try {
            const res = await hsnBrowserAPI.stats();
            setStats(res.data);
        } catch { /* ignore */ }
    };

    const loadRates = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.page, limit: 30 };
            if (selectedCategory) params.category_id = selectedCategory;
            if (selectedRate) params.rate = selectedRate;
            if (search) params.search = search;

            const res = await hsnBrowserAPI.browse(params);
            setRates(res.data.rates || []);
            setDistribution(res.data.distribution || {});
            setPagination(prev => ({ ...prev, ...res.data.pagination }));
        } catch { /* ignore */ }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPagination(p => ({ ...p, page: 1 }));
    };

    const slabColors = { 0: "#22c55e", 5: "#3b82f6", 12: "#a855f7", 18: "#f59e0b", 28: "#ef4444" };
    const totalInDist = Object.values(distribution).reduce((s, v) => s + v, 0) || 1;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>📚 <span className="gradient-text">HSN Code Browser</span></h1>
                    <p className="subtitle">Browse {stats?.total || 0} HSN/SAC codes across {stats?.categories || 0} categories</p>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="dashboard-stats" style={{ marginBottom: "2rem" }}>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">📊</span>
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total HSN Codes</span>
                    </div>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">📁</span>
                        <span className="stat-value">{stats.categories}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">💎</span>
                        <span className="stat-value">{stats.withCess}</span>
                        <span className="stat-label">With Cess</span>
                    </div>
                    <div className="stat-card glass-card">
                        <span className="stat-icon">🔄</span>
                        <span className="stat-value">{stats.rcmCount}</span>
                        <span className="stat-label">RCM Items</span>
                    </div>
                </div>
            )}

            {/* Rate Distribution Bar */}
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>📈 Rate Distribution</h3>
                <div style={{ display: "flex", height: "30px", borderRadius: "8px", overflow: "hidden", gap: "2px" }}>
                    {Object.entries(distribution).sort(([a], [b]) => Number(a) - Number(b)).map(([rate, count]) => (
                        <div key={rate} style={{
                            width: `${(count / totalInDist) * 100}%`,
                            background: slabColors[Number(rate)] || "#6b7280",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 700, color: "white", minWidth: "30px",
                        }} title={`${rate}%: ${count} items`}>
                            {rate}%
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                    {Object.entries(distribution).sort(([a], [b]) => Number(a) - Number(b)).map(([rate, count]) => (
                        <span key={rate} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: slabColors[Number(rate)] || "#6b7280", display: "inline-block", marginRight: 4 }}></span>
                            {rate}%: {count}
                        </span>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div className="form-group" style={{ flex: 2, minWidth: "200px", marginBottom: 0 }}>
                        <label>Search HSN/Description</label>
                        <input className="input" placeholder="e.g., 8471 or Laptop..." value={search} onChange={handleSearch} />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: "150px", marginBottom: 0 }}>
                        <label>Category</label>
                        <select className="input" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                            <option value="">All Categories</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name} ({c.count})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: "120px", marginBottom: 0 }}>
                        <label>GST Rate</label>
                        <select className="input" value={selectedRate} onChange={e => { setSelectedRate(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
                            <option value="">All Rates</option>
                            {[0, 5, 12, 18, 28].map(r => (
                                <option key={r} value={r}>{r}%</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="ai-thinking"><div className="thinking-dots"><span></span><span></span><span></span></div>Loading...</div>
            ) : (
                <>
                    <div className="table-wrapper glass-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{pagination.total} results found</p>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>HSN/SAC</th>
                                    <th>Description</th>
                                    <th>GST</th>
                                    <th>Cess</th>
                                    <th>Category</th>
                                    <th>RCM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map(r => (
                                    <tr key={r.id}>
                                        <td><span className="code-badge">{r.hsn_sac_code}</span></td>
                                        <td style={{ maxWidth: "300px" }}>{r.description}</td>
                                        <td><span className={`slab-badge slab-badge-${r.rate_percent}`}>{r.rate_percent}%</span></td>
                                        <td>{r.cess_percent > 0 ? <span style={{ color: "#ef4444" }}>{r.cess_percent}%</span> : "—"}</td>
                                        <td><span className="category-tag">{r.category || "—"}</span></td>
                                        <td>{r.is_rcm ? "✅" : "—"}</td>
                                    </tr>
                                ))}
                                {rates.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>No results found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                            <button className="btn btn-secondary btn-sm" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>← Prev</button>
                            <span style={{ padding: "0.375rem 0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button className="btn btn-secondary btn-sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next →</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
