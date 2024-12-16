const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineWarehouseDetail(sequelize) {
  const warehousedetail = sequelize.define(
    "warehousefile2",
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
        foreignKey: true,
      },
      postypcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      prccde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      is_active: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      tableName: "warehousefile2",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {};

  const instance = new BaseModel(warehousedetail);
  return {instance, initializeRelations};
}

module.exports = {defineWarehouseDetail: defineWarehouseDetail};
