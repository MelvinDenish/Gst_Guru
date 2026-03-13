const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Expense = sequelize.define("Expense", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    vendor_name: { type: DataTypes.STRING, allowNull: false },
    vendor_gstin: { type: DataTypes.STRING, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    gst_paid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    eligible_itc: { type: DataTypes.BOOLEAN, defaultValue: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
});

module.exports = Expense;
