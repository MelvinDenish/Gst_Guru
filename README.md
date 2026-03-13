# 🧾 GST Guru — Dynamic GST Calculation System

A full-stack web application for comprehensive GST (Goods & Services Tax) management in India. Built for businesses, accountants, and tax professionals to calculate GST, manage invoices, track filings, and stay compliant — all in one place.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

### 🔢 GST Calculation Engine
- **Single Item Calculation** — Forward (base → total) and reverse (MRP → base) modes
- **Bundle Calculator** — Composite supply (principal rate) and mixed supply (highest rate)
- **Batch Calculation** — Process up to 100 items at once
- **Smart Rate Resolution** — Price-slab-based rates (e.g., footwear), automobile cess variants
- **Inter/Intra-State** — Auto-determines CGST+SGST vs IGST based on supply/consumption state
- **Reverse Charge Mechanism (RCM)** — Automatic detection and zero-tax calculations
- **Discount Support** — Percentage or flat amount discounts applied before tax

### 🤖 AI-Powered Tools (Groq LLM)
- **Smart GST Lookup** — Search products by name/brand, get HSN code + rate + AI explanation
- **Invoice Analyzer** — Paste invoice text → AI extracts all fields, items, taxes, and flags discrepancies
- **Multi-Brand Comparison** — Compare GST rates across 2-5 products/brands
- **AI Tax Advisory** — Ask ITC eligibility questions, get cited section references

### 📋 HSN/SAC Browser
- **Browse 500+ HSN Codes** organized by 12+ categories
- **Search** by code or description
- **Filter** by rate (0%, 5%, 12%, 18%, 28%) or category
- **Rate Distribution Stats** — Visual breakdown of items per rate slab

### 🧮 ITC (Input Tax Credit) Calculator
- **Section 17(5) Compliance** — Auto-blocks ineligible categories (motor vehicles, food, construction, etc.)
- **Proportional Claims** — Partial business-use percentage support
- **IGST Utilization Order** — Correct offset sequence
- **AI Tax Advisory** — Contextual tax advice for complex scenarios

### 🔐 GSTIN Validator
- Format validation (15-character structure: state code + PAN + entity + check digit)
- Luhn-like **checksum verification**
- State code identification across all 38 Indian states/UTs

### 📄 Invoice Management
- **Create Sale/Purchase Invoices** with auto-generated invoice numbers
- **Line-item tax calculation** — Per-item GST rate with auto-totaling
- **Payment Tracking** — Paid, unpaid, partial status + amount tracking
- **Revenue & Outstanding Stats** — Dashboard widgets

### 📊 Compliance & Filing
- **Filing Records** — Track GSTR-1, GSTR-3B, GSTR-9, GSTR-9C, CMP-08, GSTR-4
- **Tax Calendar** — Auto-generated deadlines with urgency levels (urgent/warning/normal)
- **Compliance Reports** — Generate reports with compliance score, alerts, and financial summaries
- **Penalty & Interest Calculator** — Late fee (Section 47), interest (Section 50), general penalties (Section 122)
- **CSV Export** — Download compliance reports as CSV

### 📦 E-Way Bill Generator
- Auto-determines if E-Way bill is required (threshold: ₹50,000)
- Validity calculation based on distance (1-15 days)
- Transport details: mode, vehicle, transporter ID

### 🔔 Notifications & Rate Alerts
- **Rate Change Alerts** — Subscribe to HSN codes, get notified on rate changes
- **System Notifications** — Mark as read / mark all as read

### 👤 User Management
- **JWT Authentication** — Access token (15 min) + refresh token (7 days) with HTTP-only cookies
- **Role-Based Access** — Admin vs Business user roles
- **Product Portfolio** — Save frequently-used products with auto-enriched current rates

### ⚙️ Admin Panel
- **Rate Management** — CRUD for GST rates with automatic subscriber notifications
- **Category Management** — Hierarchical categories with parent-child relationships
- **CSV Bulk Upload** — Import rates via CSV with auto-category matching
- **Rate Sync** — Scheduled + manual sync from external sources (CBIC scraper)
- **Sync Logs** — Audit trail of all sync operations

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, React Router 7, Axios |
| **Backend** | Node.js, Express 4 |
| **Database** | SQLite 3 (via Sequelize ORM) |
| **Auth** | JWT (access + refresh tokens), bcryptjs |
| **AI** | Groq API (Llama 3.3 70B) |
| **Scheduling** | node-cron |
| **File Upload** | Multer |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **npm** installed
- (Optional) **Groq API Key** for AI features — [Get one free](https://console.groq.com)

### 1. Clone the repository
```bash
git clone <repository-url>
cd Gst_Guru
```

### 2. Set up the Backend
```bash
cd backend
npm install

# (Optional) Create .env file for AI features
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "JWT_SECRET=your_secret_key" >> .env
echo "JWT_REFRESH_SECRET=your_refresh_secret" >> .env

# Seed the database (creates categories, 500+ GST rates, admin & demo users)
npm run seed

# Start the server
npm run dev
```
Backend runs on **http://localhost:5000**

### 3. Set up the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on **http://localhost:5173**

### 4. Open in browser
Navigate to `http://localhost:5173`

---

## 🔑 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gstguru.in` | `admin123` |
| Business User | `demo@business.in` | `business123` |

---

## 📁 Project Structure

```
Gst_Guru/
├── backend/
│   ├── config/              # Database configuration
│   ├── data/                # Seed data files (500+ GST items)
│   │   ├── categories.js
│   │   ├── gst_food_agri.js
│   │   ├── gst_textile_elec_health.js
│   │   ├── gst_auto_luxury.js
│   │   ├── gst_services_construction_edu.js
│   │   ├── gst_additional.js
│   │   └── gst_system.db     # SQLite database
│   ├── middleware/
│   │   └── auth.js           # JWT auth, role-based access
│   ├── models/               # Sequelize models
│   │   ├── User.js
│   │   ├── GstRate.js
│   │   ├── Category.js
│   │   ├── Calculation.js
│   │   ├── Invoice.js
│   │   ├── FilingRecord.js
│   │   ├── ComplianceReport.js
│   │   ├── BusinessProduct.js
│   │   ├── Notification.js
│   │   ├── RateAlert.js
│   │   └── SyncLog.js
│   ├── routes/               # 16 API route files
│   │   ├── auth.js           # Register, login, logout, refresh, me
│   │   ├── calculate.js      # Single, bundle, batch, states
│   │   ├── ai-lookup.js      # AI search, GSTIN, E-Way, analyzer, penalty, compare
│   │   ├── hsn-browser.js    # Categories, browse, stats
│   │   ├── invoices.js       # CRUD + stats + payment status
│   │   ├── filings.js        # CRUD + upcoming + calendar
│   │   ├── compliance.js     # List, generate, export CSV
│   │   ├── itc.js            # ITC calculator + AI advice
│   │   ├── products.js       # User product portfolio
│   │   ├── notifications.js  # List, mark read
│   │   ├── rateAlerts.js     # Subscribe/unsubscribe
│   │   ├── rates.js          # Public rate search
│   │   ├── categories.js     # Public category list
│   │   ├── calculations.js   # Calculation history + export
│   │   ├── admin.js          # Rate/category CRUD, bulk upload, sync
│   │   └── invoice.js        # Legacy HTML invoice renderer
│   ├── services/
│   │   ├── aiGstLookup.js    # Groq AI integration
│   │   ├── cbicScraper.js    # CBIC rate scrapper
│   │   ├── gstApiClient.js   # External GST API client
│   │   ├── rateSyncService.js # Rate sync logic
│   │   └── scheduler.js      # Cron-based scheduling
│   ├── seed.js               # Database seeder
│   └── server.js             # Express app entry point
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── index.js       # Axios instance + all API functions
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── Toast.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx # Auth state + login/register/logout
    │   ├── pages/             # 17 page components
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── GstLookup.jsx        # AI lookup, GSTIN, E-Way, analyzer, penalty, compare
    │   │   ├── HsnBrowser.jsx       # HSN code browser
    │   │   ├── BundleCalculator.jsx  # Composite/mixed supply
    │   │   ├── Products.jsx         # Product portfolio
    │   │   ├── History.jsx          # Calculation history
    │   │   ├── InvoiceTracker.jsx   # Invoice management
    │   │   ├── FilingRecords.jsx    # Filing tracker
    │   │   ├── TaxCalendar.jsx      # Deadline calendar
    │   │   ├── ComplianceReports.jsx # Report generator
    │   │   ├── ItcCalculator.jsx    # ITC calculator
    │   │   ├── Notifications.jsx    # Notification center
    │   │   ├── AdminRates.jsx       # Admin rate management
    │   │   └── AdminCategories.jsx  # Admin category management
    │   ├── App.jsx            # Router + protected routes
    │   ├── index.css          # Global styles
    │   └── main.jsx           # React entry point
    ├── index.html
    └── vite.config.js
```

---

## 🔌 API Endpoints

### Public (No Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/calculate` | Single-item GST calculation |
| `POST` | `/api/calculate/bundle` | Bundle (composite/mixed) calculation |
| `POST` | `/api/calculate/batch` | Batch calculation (up to 100 items) |
| `GET` | `/api/calculate/states` | List Indian states |
| `POST` | `/api/ai-lookup` | AI-powered GST lookup |
| `POST` | `/api/ai-lookup/validate-gstin` | GSTIN validation |
| `POST` | `/api/ai-lookup/eway-bill` | E-Way bill generator |
| `POST` | `/api/ai-lookup/analyze-invoice` | AI invoice analyzer |
| `POST` | `/api/ai-lookup/penalty-calc` | Penalty & interest calculator |
| `POST` | `/api/ai-lookup/compare` | Multi-product comparison |
| `GET` | `/api/hsn/categories` | HSN categories |
| `GET` | `/api/hsn/browse` | Browse HSN codes |
| `GET` | `/api/hsn/stats` | HSN rate statistics |
| `GET` | `/api/rates` | Search GST rates |
| `GET` | `/api/categories` | List categories |

### Authenticated (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/logout` | Logout |
| `GET/POST/PUT/DELETE` | `/api/products` | Product portfolio CRUD |
| `GET` | `/api/calculations` | Calculation history |
| `GET` | `/api/calculations/export` | Export calculations as CSV |
| `GET/POST/PUT/DELETE` | `/api/invoices` | Invoice CRUD |
| `GET` | `/api/invoices/stats` | Invoice statistics |
| `PATCH` | `/api/invoices/:id/status` | Update payment status |
| `GET/POST/PUT/DELETE` | `/api/filings` | Filing records CRUD |
| `GET` | `/api/filings/upcoming` | Upcoming deadlines |
| `GET` | `/api/filings/calendar` | Tax calendar events |
| `GET/POST` | `/api/compliance` | Compliance reports |
| `GET` | `/api/compliance/export/:id` | Export report as CSV |
| `POST` | `/api/itc/calculate` | ITC calculator |
| `POST` | `/api/itc/ai-advice` | AI tax advisory |
| `GET/PATCH` | `/api/notifications` | Notifications |
| `GET/POST/DELETE` | `/api/rate-alerts` | Rate alert subscriptions |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST/PUT/DELETE` | `/api/admin/rates` | Rate management |
| `POST` | `/api/admin/rates/bulk-upload` | CSV bulk upload |
| `GET/POST/PUT/DELETE` | `/api/admin/categories` | Category management |
| `POST` | `/api/admin/sync/trigger` | Trigger manual rate sync |
| `GET` | `/api/admin/sync/status` | Sync status |
| `GET` | `/api/admin/sync/logs` | Sync logs |

---

## 🔧 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GROQ_API_KEY=your_groq_api_key    # Required for AI features
```

> **Note:** The app runs without `GROQ_API_KEY`, but AI-powered features (smart lookup, invoice analyzer, product comparison, AI tax advisory) will be disabled.

---

## 📜 Scripts

### Backend
```bash
npm start         # Start production server
npm run dev       # Start with auto-reload (--watch)
npm run seed      # Seed database with GST rates, categories, and users
```

### Frontend
```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ for India's GST ecosystem
</p>
