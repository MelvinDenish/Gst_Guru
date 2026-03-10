const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Invoice = sequelize.define("Invoice", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    invoice_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    invoice_type: {
        type: DataTypes.ENUM("sale", "purchase"),
        defaultValue: "sale",
    },
    buyer_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    buyer_gstin: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    buyer_address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    seller_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    seller_gstin: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    invoice_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    place_of_supply: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    place_of_delivery: {
        type: DataTypes.STRING(2),
        allowNull: true,
    },
    items_json: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const raw = this.getDataValue("items_json");
            return raw ? JSON.parse(raw) : [];
        },
        set(val) {
            this.setDataValue("items_json", JSON.stringify(val));
        },
    },
    subtotal: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    cgst: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    sgst: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    igst: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    cess: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
    },
    payment_status: {
        type: DataTypes.ENUM("unpaid", "partial", "paid"),
        defaultValue: "unpaid",
    },
    amount_paid: {
        type: DataTypes.DECIMAL(14, 2),
        defaultValue: 0,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

module.exports = Invoice;
