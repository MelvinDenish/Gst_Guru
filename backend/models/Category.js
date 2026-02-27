const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define("Category", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "Categories", key: "id" },
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    hsn_sac_range: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
});

Category.hasMany(Category, { as: "children", foreignKey: "parent_id" });
Category.belongsTo(Category, { as: "parent", foreignKey: "parent_id" });

module.exports = Category;
