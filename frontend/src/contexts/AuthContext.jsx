import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    const syncUser = useCallback(async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) { setLoading(false); return; }
            const { data } = await authAPI.me();
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch {
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { syncUser(); }, [syncUser]);

    const login = async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.accessToken);
        return data;
    };

    const register = async (formData) => {
        const { data } = await authAPI.register(formData);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.accessToken);
        return data;
    };

    const logout = async () => {
        try { await authAPI.logout(); } catch { }
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
}
