const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Party = sequelize.define("Party", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("customer", "vendor", "both"), allowNull: false },
    gstin: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true }
});

module.exports = Party;
