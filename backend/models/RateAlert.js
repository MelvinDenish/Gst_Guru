const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RateAlert = sequelize.define("RateAlert", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    hsn_sac_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
});

module.exports = RateAlert;
