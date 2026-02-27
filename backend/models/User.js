const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("business", "admin"),
        defaultValue: "business",
    },
    business_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    gstin: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    refresh_token: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
});

module.exports = User;
