import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

function NavDropdown({ title, icon, links, closeMenu, isActive }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`nav-dropdown ${isActive ? 'active-group' : ''}`} ref={dropdownRef}>
            <button className="nav-dropdown-toggle" onClick={() => setOpen(!open)}>
                <span className="dropdown-icon">{icon}</span>
                {title}
                <span className={`dropdown-arrow ${open ? 'open' : ''}`}>▼</span>
            </button>
            <div className={`dropdown-menu ${open ? 'show' : ''}`}>
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        to={link.path}
                        className={`dropdown-item-link ${link.special ? link.special : ''}`}
                        onClick={() => {
                            setOpen(false);
                            closeMenu();
                        }}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const isAdmin = user?.role === "admin";
    const currentPath = location.pathname;

    const navGroups = [
        {
            title: "Tools",
            icon: "🧰",
            links: [
                { path: "/", label: "Calculator" },
                { path: "/bundle", label: "Bundle Calc" },
                { path: "/gst-lookup", label: "🤖 AI Lookup", special: "nav-link-ai" },
                { path: "/hsn-browser", label: "📚 HSN Codes" },
                { path: "/pricing", label: "🏷️ Pricing" },
            ],
            isActive: ["/", "/bundle", "/gst-lookup", "/hsn-browser", "/pricing"].includes(currentPath)
        },
        // Only show these if logged in
        ...(user ? [
            {
                title: "Business",
                icon: "🏢",
                links: [
                    { path: "/dashboard", label: "Dashboard" },
                    { path: "/invoices", label: "Invoice Tracker" },
                    { path: "/expenses", label: "Expense Tracker" }, // NEW
                    { path: "/parties", label: "Customers/Vendors" }, // NEW
                    { path: "/itc", label: "ITC Calculator" },
                    { path: "/insights", label: "💡 Insights", special: "nav-link-insights" },
                ],
                isActive: ["/dashboard", "/invoices", "/expenses", "/parties", "/itc", "/insights"].includes(currentPath)
            },
            {
                title: "Compliance",
                icon: "📋",
                links: [
                    { path: "/filings", label: "Filing Records" },
                    { path: "/returns", label: "GST Returns (New)" }, // NEW
                    { path: "/compliance", label: "Compliance Reports" },
                    { path: "/tax-calendar", label: "📅 Tax Calendar" },
                ],
                isActive: ["/filings", "/returns", "/compliance", "/tax-calendar"].includes(currentPath)
            },
            {
                title: "My Account",
                icon: "👤",
                links: [
                    { path: "/products", label: "My Products" },
                    { path: "/history", label: "Calculation History" },
                    { path: "/notifications", label: "Notifications" },
                    ...(isAdmin ? [
                        { path: "/admin/rates", label: "Admin: Rates", special: "admin-link" },
                        { path: "/admin/categories", label: "Admin: Categories", special: "admin-link" }
                    ] : [])
                ],
                isActive: ["/products", "/history", "/notifications", "/admin/rates", "/admin/categories"].includes(currentPath)
            }
        ] : [])
    ];

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

                {/* Overlay for mobile */}
                {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)}></div>}

                <div className={`nav-links-wrapper ${menuOpen ? "open" : ""}`}>
                    <div className="nav-links">
                        {/* Render Dropdown Groups */}
                        {navGroups.map((group, idx) => (
                            <NavDropdown
                                key={idx}
                                title={group.title}
                                icon={group.icon}
                                links={group.links}
                                closeMenu={() => setMenuOpen(false)}
                                isActive={group.isActive}
                            />
                        ))}
                    </div>

                    {user ? (
                        <div className="nav-user">
                            <span className="user-badge" title={user.name}>{user.name?.charAt(0).toUpperCase()}</span>
                            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
                        </div>
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
