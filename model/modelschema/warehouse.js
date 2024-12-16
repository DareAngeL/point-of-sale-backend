const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineWarehouse(sequelize) {
  const warehouse = sequelize.define(
    "warehousefile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      warcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      wardsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      tableName: "warehousefile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {
    const warehousedetail = modelList["warehousedetail"].instance.GetInstance();

    warehouse.hasMany(warehousedetail, {
      foreignKey: "warcde",
      sourceKey: "warcde",
    });
    warehousedetail.belongsTo(warehouse, {
      foreignKey: "warcde",
      targetKey: "warcde",
    });
  };

  const instance = new BaseModel(warehouse);
  return {instance, initializeRelations};
}

module.exports = {defineWarehouse: defineWarehouse};
