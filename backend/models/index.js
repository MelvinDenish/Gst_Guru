const sequelize = require("../config/database");
const User = require("./User");
const Category = require("./Category");
const GstRate = require("./GstRate");
const BusinessProduct = require("./BusinessProduct");
const Calculation = require("./Calculation");
const Notification = require("./Notification");
const RateAlert = require("./RateAlert");

// ── Associations ──────────────────────────────────────────
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

module.exports = {
    sequelize,
    User,
    Category,
    GstRate,
    BusinessProduct,
    Calculation,
    Notification,
    RateAlert,
};
