const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineSpecialRequestDetail(sequelize) {
  const specialrequestDetail = sequelize.define(
    "orderitemmodifierfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      modcde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      ordercde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      modprc: {
        type: DataTypes.DECIMAL(20),
        allowNull: true,
      },
      orderitmid: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      tempid: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "orderitemmodifierfile",
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

  const instance = new BaseModel(specialrequestDetail);
  return {instance, initializeRelations, sqlInstance: sequelize};
}

module.exports = {defineSpecialRequestDetail: defineSpecialRequestDetail};
