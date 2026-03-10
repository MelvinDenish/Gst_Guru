const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ComplianceReport = sequelize.define("ComplianceReport", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    report_type: {
        type: DataTypes.ENUM("monthly", "quarterly", "annual"),
        allowNull: false,
    },
    period: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    financial_year: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    total_sales: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    total_purchases: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    output_tax: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    input_tax: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    net_liability: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    compliance_score: {
        type: DataTypes.INTEGER,
        defaultValue: 100, // 0-100
    },
    total_invoices: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    filings_on_time: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    filings_late: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    alerts_json: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const raw = this.getDataValue("alerts_json");
            return raw ? JSON.parse(raw) : [];
        },
        set(val) {
            this.setDataValue("alerts_json", val ? JSON.stringify(val) : null);
        },
    },
});

module.exports = ComplianceReport;
