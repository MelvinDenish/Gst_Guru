const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const { sequelize } = require("./models");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/rates", require("./routes/rates"));
app.use("/api/calculate", require("./routes/calculate"));
app.use("/api/products", require("./routes/products"));
app.use("/api/calculations", require("./routes/calculations"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/rate-alerts", require("./routes/rateAlerts"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/invoice", require("./routes/invoice"));

// ── Health check ──────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────
const scheduler = require("./services/scheduler");

async function start() {
    try {
        await sequelize.sync();
        console.log("Database synced");

        // Start automatic rate sync scheduler
        scheduler.start();

        app.listen(PORT, () => {
            console.log(`GST Calculation System API running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

start();
