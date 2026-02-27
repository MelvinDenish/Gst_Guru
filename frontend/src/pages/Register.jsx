import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", business_name: "", gstin: "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            navigate("/dashboard");
        } catch (err) {
            setToast({ message: err.response?.data?.error || "Registration failed", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page auth-page">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <span className="auth-icon">📝</span>
                    <h1>Create Account</h1>
                    <p>Register your business to unlock all features</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" className="input" placeholder="John Doe" value={form.name}
                                onChange={update("name")} required />
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" className="input" placeholder="you@business.com" value={form.email}
                                onChange={update("email")} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input type="password" className="input" placeholder="Min 6 characters" value={form.password}
                            onChange={update("password")} required minLength={6} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Business Name</label>
                            <input type="text" className="input" placeholder="Acme Corp" value={form.business_name}
                                onChange={update("business_name")} />
                        </div>
                        <div className="form-group">
                            <label>GSTIN (Optional)</label>
                            <input type="text" className="input" placeholder="22AAAAA0000A1Z5" value={form.gstin}
                                onChange={update("gstin")} maxLength={15} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <span className="spinner"></span> : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </div>
    );
}
