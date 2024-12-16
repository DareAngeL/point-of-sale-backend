const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineVoidReason(sequelize) {
  const voidreason = sequelize.define(
    "voidreasonfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      voidcde: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
      },
    },
    {
      tableName: "voidreasonfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["voidcde"],
        },
      ],
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(voidreason);
  return {instance, initializeRelations};
}

module.exports = {defineVoidReason: defineVoidReason};
