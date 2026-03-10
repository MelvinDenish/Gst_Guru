const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FilingRecord = sequelize.define("FilingRecord", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    return_type: {
        type: DataTypes.ENUM("GSTR-1", "GSTR-3B", "GSTR-9", "GSTR-9C", "CMP-08", "GSTR-4"),
        allowNull: false,
    },
    period: {
        type: DataTypes.STRING(20),
        allowNull: false, // e.g., "Mar 2026", "Q1 2026"
    },
    financial_year: {
        type: DataTypes.STRING(10),
        allowNull: false, // e.g., "2025-26"
    },
    filing_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("draft", "pending", "filed", "late"),
        defaultValue: "pending",
    },
    total_liability: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    itc_claimed: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    tax_paid: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    late_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    arn_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = FilingRecord;
