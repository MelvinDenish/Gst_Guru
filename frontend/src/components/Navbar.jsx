import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    <span className="brand-icon">⚡</span>
                    <span className="brand-text">GST<span className="brand-accent">Guru</span></span>
                </Link>

                <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    <span className={`hamburger ${menuOpen ? "active" : ""}`}></span>
                </button>

                <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                    <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Calculator</Link>
                    <Link to="/bundle" className="nav-link" onClick={() => setMenuOpen(false)}>Bundle</Link>
                    <Link to="/gst-lookup" className="nav-link nav-link-ai" onClick={() => setMenuOpen(false)}>🤖 AI Lookup</Link>
                    <Link to="/hsn-browser" className="nav-link" onClick={() => setMenuOpen(false)}>📚 HSN Codes</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <Link to="/invoices" className="nav-link" onClick={() => setMenuOpen(false)}>Invoices</Link>
                            <Link to="/filings" className="nav-link" onClick={() => setMenuOpen(false)}>Filings</Link>
                            <Link to="/compliance" className="nav-link" onClick={() => setMenuOpen(false)}>Compliance</Link>
                            <Link to="/itc" className="nav-link" onClick={() => setMenuOpen(false)}>ITC Calc</Link>
                            <Link to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>Products</Link>
                            <Link to="/history" className="nav-link" onClick={() => setMenuOpen(false)}>History</Link>
                            <Link to="/notifications" className="nav-link" onClick={() => setMenuOpen(false)}>
                                Notifications
                            </Link>
                            {user.role === "admin" && (
                                <>
                                    <Link to="/admin/rates" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>Admin Rates</Link>
                                    <Link to="/admin/categories" className="nav-link admin-link" onClick={() => setMenuOpen(false)}>Categories</Link>
                                </>
                            )}
                            <div className="nav-user">
                                <span className="user-badge">{user.name?.charAt(0).toUpperCase()}</span>
                                <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
                            </div>
                        </>
                    ) : (
                        <div className="nav-auth">
                            <Link to="/login" className="nav-btn login-btn" onClick={() => setMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="nav-btn register-btn" onClick={() => setMenuOpen(false)}>Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
