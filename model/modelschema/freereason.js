const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineFreeReason(sequelize) {
  const freeReason = sequelize.define(
    "freereasonfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      freereason: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
    },
    {
      tableName: "freereasonfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
      ],
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(freeReason);
  return {instance, initializeRelations};
}

module.exports = {defineFreeReason: defineFreeReason};
