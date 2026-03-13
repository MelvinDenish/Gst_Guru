const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GstReturn = sequelize.define("GstReturn", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    return_type: { type: DataTypes.ENUM("GSTR-1", "GSTR-3B"), allowNull: false },
    period_month: { type: DataTypes.INTEGER, allowNull: false },
    period_year: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM("draft", "filed"), defaultValue: "draft" },
    data: { type: DataTypes.JSON, allowNull: false }
});

module.exports = GstReturn;
