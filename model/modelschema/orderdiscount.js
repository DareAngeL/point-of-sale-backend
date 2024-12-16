const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineOrderDiscount(sequelize) {
  const orderdiscount = sequelize.define(
    "orderdiscountfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
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
      exemptvat: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scnum: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scnam: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scdteissued: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      pwdnum: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pwdnam: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pwddteissued: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      peritem: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      orderitmid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      billdocnum: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
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
    },
    {
      tableName: "orderdiscountfile",
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

  const instance = new BaseModel(orderdiscount);
  return {instance, initializeRelations};
}

module.exports = {defineOrderDiscount: defineOrderDiscount};
