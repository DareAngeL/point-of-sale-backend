const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineOrderItemDiscount(sequelize) {
  const orderitemdiscount = sequelize.define(
    "orderitemdiscountfile",
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
      orderitmid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      discde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      distyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      disamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0",
      },
      disper: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0",
      },
      tempid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ordercde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      amtdis: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      salwoutvat: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      lessvatadj: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      exemptvat: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      disid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      nolessvat: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: "0",
      },
      govdisc: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: "0",
      },
      scharge: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: "0",
      },
    },
    {
      tableName: "orderitemdiscountfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["ordercde"],
        },
        {
          fields: ["orderitmid"],
        },
      ],
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(orderitemdiscount);
  return {instance, initializeRelations};
}

module.exports = {defineOrderItemDiscount: defineOrderItemDiscount};
