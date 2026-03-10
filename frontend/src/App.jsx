import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import AdminRates from "./pages/AdminRates";
import AdminCategories from "./pages/AdminCategories";
import BundleCalculator from "./pages/BundleCalculator";
import GstLookup from "./pages/GstLookup";
import InvoiceTracker from "./pages/InvoiceTracker";
import FilingRecords from "./pages/FilingRecords";
import ComplianceReports from "./pages/ComplianceReports";
import "./index.css";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner" />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bundle" element={<BundleCalculator />} />
          <Route path="/gst-lookup" element={<GstLookup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceTracker /></ProtectedRoute>} />
          <Route path="/filings" element={<ProtectedRoute><FilingRecords /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceReports /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin/rates" element={<ProtectedRoute adminOnly><AdminRates /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="footer">
        <p>© 2026 GST Guru — Dynamic GST Calculation System</p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
