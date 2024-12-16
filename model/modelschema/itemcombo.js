const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineItemCombo(sequelize) {
  const itemcombo = sequelize.define(
    "itemcombofile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      itmcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      itmcomcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      itmdsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      untmea: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      itmcomtyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      upgprc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0",
      },
      itmcderef: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      itmnum: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      combodocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      }
    },
    {
      tableName: "itemcombofile",
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

  const instance = new BaseModel(itemcombo);
  return {instance, initializeRelations};
}

module.exports = {defineItemCombo: defineItemCombo};
