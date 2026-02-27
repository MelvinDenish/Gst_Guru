import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            navigate(data.user.role === "admin" ? "/admin/rates" : "/dashboard");
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Login failed", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page auth-page">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <span className="auth-icon">🔐</span>
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="input" placeholder="you@business.com" value={email}
                            onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="input" placeholder="••••••••" value={password}
                            onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <span className="spinner"></span> : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>

                <div className="demo-creds">
                    <p><strong>Demo:</strong> demo@business.in / business123</p>
                    <p><strong>Admin:</strong> admin@gstguru.in / admin123</p>
                </div>
            </div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
