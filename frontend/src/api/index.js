import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        if (err.response?.status === 401 && err.response?.data?.code === "TOKEN_EXPIRED" && !original._retry) {
            original._retry = true;
            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
                localStorage.setItem("accessToken", data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch (refreshErr) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(refreshErr);
            }
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    logout: () => api.post("/auth/logout"),
    me: () => api.get("/auth/me"),
    refresh: () => api.post("/auth/refresh"),
};

// ── Rates ─────────────────────────────────────────────────
export const ratesAPI = {
    search: (params) => api.get("/rates", { params }),
    getByHSN: (hsn) => api.get(`/rates/${hsn}`),
};

// ── Calculate ─────────────────────────────────────────────
export const calculateAPI = {
    compute: (data) => api.post("/calculate", data),
    bundle: (data) => api.post("/calculate/bundle", data),
    batch: (data) => api.post("/calculate/batch", data),
    getStates: () => api.get("/calculate/states"),
};

// ── Invoice (legacy HTML) ─────────────────────────────────
export const invoiceAPI = {
    getUrl: (id) => `${API_BASE}/invoice/${id}`,
};

// ── Invoices (new DB-backed tracking) ─────────────────────
export const invoicesAPI = {
    list: (params) => api.get("/invoices", { params }),
    stats: () => api.get("/invoices/stats"),
    create: (data) => api.post("/invoices", data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    updateStatus: (id, data) => api.patch(`/invoices/${id}/status`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
};

// ── Filing Records ────────────────────────────────────────
export const filingsAPI = {
    list: (params) => api.get("/filings", { params }),
    upcoming: () => api.get("/filings/upcoming"),
    create: (data) => api.post("/filings", data),
    update: (id, data) => api.put(`/filings/${id}`, data),
    delete: (id) => api.delete(`/filings/${id}`),
};

// ── Compliance Reports ────────────────────────────────────
export const complianceAPI = {
    list: (params) => api.get("/compliance", { params }),
    get: (id) => api.get(`/compliance/${id}`),
    generate: (data) => api.post("/compliance/generate", data),
    exportCSV: (id) => api.get(`/compliance/export/${id}`, { responseType: "blob" }),
};

// ── AI Lookup ─────────────────────────────────────────────
export const aiLookupAPI = {
    search: (query) => api.post("/ai-lookup", { query }),
    validateGSTIN: (gstin) => api.post("/ai-lookup/validate-gstin", { gstin }),
    ewayBill: (data) => api.post("/ai-lookup/eway-bill", data),
};

// ── Products ──────────────────────────────────────────────
export const productsAPI = {
    list: () => api.get("/products"),
    create: (data) => api.post("/products", data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// ── Calculations ──────────────────────────────────────────
export const calculationsAPI = {
    history: (params) => api.get("/calculations", { params }),
    exportCSV: () => api.get("/calculations/export", { responseType: "blob" }),
};

// ── Notifications ─────────────────────────────────────────
export const notificationsAPI = {
    list: () => api.get("/notifications"),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch("/notifications/read-all"),
};

// ── Rate Alerts ───────────────────────────────────────────
export const alertsAPI = {
    list: () => api.get("/rate-alerts"),
    subscribe: (hsn_sac_code) => api.post("/rate-alerts", { hsn_sac_code }),
    unsubscribe: (hsn) => api.delete(`/rate-alerts/${hsn}`),
};

// ── Categories ────────────────────────────────────────────
export const categoriesAPI = {
    list: () => api.get("/categories"),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
    listRates: (params) => api.get("/admin/rates", { params }),
    createRate: (data) => api.post("/admin/rates", data),
    updateRate: (id, data) => api.put(`/admin/rates/${id}`, data),
    deleteRate: (id) => api.delete(`/admin/rates/${id}`),
    bulkUpload: (formData) => api.post("/admin/rates/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    }),
    listCategories: () => api.get("/admin/categories"),
    createCategory: (data) => api.post("/admin/categories", data),
    updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
    // Sync
    triggerSync: () => api.post("/admin/sync/trigger"),
    syncStatus: () => api.get("/admin/sync/status"),
    syncLogs: (params) => api.get("/admin/sync/logs", { params }),
};

// ── HSN Browser ───────────────────────────────────────────
export const hsnBrowserAPI = {
    categories: () => api.get("/hsn/categories"),
    browse: (params) => api.get("/hsn/browse", { params }),
    stats: () => api.get("/hsn/stats"),
};

// ── ITC Calculator ────────────────────────────────────────
export const itcAPI = {
    calculate: (purchases) => api.post("/itc/calculate", { purchases }),
    aiAdvice: (scenario) => api.post("/itc/ai-advice", { scenario }),
};

export default api;
