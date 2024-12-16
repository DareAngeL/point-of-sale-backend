const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineModifierfile(sequelize) {
  const modifierfile = sequelize.define(
    "modifierfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      itmcde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      modcde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      modprc: {
        type: DataTypes.FLOAT,
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
      ordercde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "modifierfile",
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

  const instance = new BaseModel(modifierfile);
  return {instance, initializeRelations};
}

module.exports = {defineModifierfile: defineModifierfile};
