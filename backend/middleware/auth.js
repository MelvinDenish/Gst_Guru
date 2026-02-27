const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "gst_guru_secret_key_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "gst_guru_refresh_secret_2026";

// Generate access & refresh tokens
function generateTokens(user) {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
    return { accessToken, refreshToken };
}

// Middleware: verify JWT and attach user to req
async function authenticate(req, res, next) {
    try {
        const token =
            req.cookies?.accessToken ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.slice(7)
                : null);

        if (!token) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ["password_hash", "refresh_token"] },
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
        }
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Middleware: optional auth — attaches user if token present, but doesn't fail
async function optionalAuth(req, res, next) {
    try {
        const token =
            req.cookies?.accessToken ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.slice(7)
                : null);

        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ["password_hash", "refresh_token"] },
            });
            if (user) req.user = user;
        }
    } catch (_) {
        // Silently continue — optional auth
    }
    next();
}

// Middleware: require specific role
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Insufficient permissions" });
        }
        next();
    };
}

module.exports = {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    generateTokens,
    authenticate,
    optionalAuth,
    requireRole,
};
