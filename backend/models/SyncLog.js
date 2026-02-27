const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SyncLog = sequelize.define("SyncLog", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    source: { type: DataTypes.STRING, allowNull: false, comment: "cbic | api | datagov | manual" },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "running", comment: "running | success | failed | partial" },
    rates_checked: { type: DataTypes.INTEGER, defaultValue: 0 },
    rates_updated: { type: DataTypes.INTEGER, defaultValue: 0 },
    rates_added: { type: DataTypes.INTEGER, defaultValue: 0 },
    errors: { type: DataTypes.INTEGER, defaultValue: 0 },
    details_json: { type: DataTypes.TEXT, allowNull: true, comment: "JSON stringified details/errors" },
    started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    completed_at: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: "sync_logs",
    timestamps: false,
});

module.exports = SyncLog;
