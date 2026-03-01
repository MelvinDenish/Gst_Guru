const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GstRate = sequelize.define("GstRate", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    hsn_sac_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rate_percent: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
    },
    cess_percent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
    },
    effective_from: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    effective_to: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    is_rcm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    price_slabs_json: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const raw = this.getDataValue("price_slabs_json");
            return raw ? JSON.parse(raw) : null;
        },
        set(val) {
            this.setDataValue("price_slabs_json", val ? JSON.stringify(val) : null);
        },
    },
    applicability_json: {
        type: DataTypes.TEXT, // JSON stored as text in SQLite
        allowNull: true,
        get() {
            const raw = this.getDataValue("applicability_json");
            return raw ? JSON.parse(raw) : null;
        },
        set(val) {
            this.setDataValue("applicability_json", val ? JSON.stringify(val) : null);
        },
    },
    category_id: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
    },
});

module.exports = GstRate;
