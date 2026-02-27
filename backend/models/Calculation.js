const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Calculation = sequelize.define("Calculation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true, // NULL for public calculations
    },
    hsn_sac_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    product_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    taxable_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    place_of_supply: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    place_of_consumption: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    transaction_type: {
        type: DataTypes.ENUM("B2B", "B2C"),
        defaultValue: "B2C",
    },
    reverse_charge: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    cgst: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    sgst: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    igst: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    cess: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    rate_used: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    rate_snapshot_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

module.exports = Calculation;
