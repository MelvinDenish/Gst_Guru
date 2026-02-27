const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BusinessProduct = sequelize.define("BusinessProduct", {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    default_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
});

module.exports = BusinessProduct;
