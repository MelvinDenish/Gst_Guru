const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    generateTokens,
    authenticate,
} = require("../middleware/auth");

const router = express.Router();

// ── Register ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
    try {
        const { email, password, name, business_name, gstin } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const password_hash = await bcrypt.hash(password, 12);
        const user = await User.create({
            email,
            password_hash,
            name,
            business_name: business_name || null,
            gstin: gstin || null,
            role: "business",
        });

        const tokens = generateTokens(user);
        user.refresh_token = tokens.refreshToken;
        await user.save();

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            sameSite: "lax",
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });

        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                business_name: user.business_name,
            },
            accessToken: tokens.accessToken,
        });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: "Registration failed" });
    }
});

// ── Login ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const tokens = generateTokens(user);
        user.refresh_token = tokens.refreshToken;
        await user.save();

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            sameSite: "lax",
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                business_name: user.business_name,
            },
            accessToken: tokens.accessToken,
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

// ── Logout ────────────────────────────────────────────────
router.post("/logout", authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user) {
            user.refresh_token = null;
            await user.save();
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).json({ error: "Logout failed" });
    }
});

// ── Refresh Token ─────────────────────────────────────────
router.post("/refresh", async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) {
            return res.status(401).json({ error: "Refresh token required" });
        }

        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || user.refresh_token !== token) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const tokens = generateTokens(user);
        user.refresh_token = tokens.refreshToken;
        await user.save();

        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
            sameSite: "lax",
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });

        res.json({ accessToken: tokens.accessToken });
    } catch (err) {
        res.status(401).json({ error: "Token refresh failed" });
    }
});

// ── Get Current User ──────────────────────────────────────
router.get("/me", authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
