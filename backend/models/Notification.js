const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define("Notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM("rate_change", "reminder"),
        defaultValue: "rate_change",
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

module.exports = Notification;
