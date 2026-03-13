const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const GstRate = require("./GstRate");
const BusinessProduct = require("./BusinessProduct");
const Calculation = require("./Calculation");
const Notification = require("./Notification");
const RateAlert = require("./RateAlert");
const SyncLog = require("./SyncLog");
const Invoice = require("./Invoice");
const FilingRecord = require("./FilingRecord");
const ComplianceReport = require("./ComplianceReport");
const Expense = require("./Expense");
const Party = require("./Party");
const GstReturn = require("./GstReturn");

// ── Existing Associations ─────────────────────────────────
GstRate.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(GstRate, { foreignKey: "category_id" });

GstRate.belongsTo(User, { as: "creator", foreignKey: "created_by" });

BusinessProduct.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(BusinessProduct, { foreignKey: "user_id" });

Calculation.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Calculation, { foreignKey: "user_id" });

Calculation.belongsTo(GstRate, { as: "rateSnapshot", foreignKey: "rate_snapshot_id" });

Notification.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Notification, { foreignKey: "user_id" });

RateAlert.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(RateAlert, { foreignKey: "user_id" });

// ── New Associations ──────────────────────────────────────
Invoice.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Invoice, { foreignKey: "user_id" });

FilingRecord.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(FilingRecord, { foreignKey: "user_id" });

ComplianceReport.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ComplianceReport, { foreignKey: "user_id" });

Expense.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Expense, { foreignKey: "user_id" });

Party.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Party, { foreignKey: "user_id" });

GstReturn.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(GstReturn, { foreignKey: "user_id" });

module.exports = {
    sequelize,
    User,
    Category,
    GstRate,
    BusinessProduct,
    Calculation,
    Notification,
    RateAlert,
    SyncLog,
    Invoice,
    FilingRecord,
    ComplianceReport,
    Expense,
    Party,
    GstReturn,
};
