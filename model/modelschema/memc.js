const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineMemc(sequelize) {
  const memc = sequelize.define(
    "memcfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      codedsc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
    },
    {
      tableName: "memcfile",
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

  const instance = new BaseModel(memc);
  return {instance, initializeRelations};
}

module.exports = {defineMemc: defineMemc};
