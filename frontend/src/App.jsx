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
import HsnBrowser from "./pages/HsnBrowser";
import ItcCalculator from "./pages/ItcCalculator";
import TaxCalendar from "./pages/TaxCalendar";
import BusinessInsights from "./pages/BusinessInsights";
import PricingTool from "./pages/PricingTool";
import GstReturns from "./pages/GstReturns";
import ExpenseTracker from "./pages/ExpenseTracker";
import CustomerVendor from "./pages/CustomerVendor";
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
          <Route path="/hsn-browser" element={<HsnBrowser />} />
          <Route path="/pricing" element={<PricingTool />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceTracker /></ProtectedRoute>} />
          <Route path="/filings" element={<ProtectedRoute><FilingRecords /></ProtectedRoute>} />
          <Route path="/compliance" element={<ProtectedRoute><ComplianceReports /></ProtectedRoute>} />
          <Route path="/itc" element={<ProtectedRoute><ItcCalculator /></ProtectedRoute>} />
          <Route path="/tax-calendar" element={<ProtectedRoute><TaxCalendar /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><BusinessInsights /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><GstReturns /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
          <Route path="/parties" element={<ProtectedRoute><CustomerVendor /></ProtectedRoute>} />
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
