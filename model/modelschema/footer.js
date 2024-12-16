const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineFooter(sequelize) {
  const footer = sequelize.define(
    "footerfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      officialreceipt: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "0",
      },
      supname: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      supaddress: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      supvarregtin: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      supnonvatregtin: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      accrenum: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      accredate: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      permitnum: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      validyr: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "0",
      },
      footermsg1: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
      },
      footermsg2: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
      },
      footermsg3: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
      },
      footermsg4: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
      },
      footermsg5: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "",
      },
      dateissued: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "footerfile",
      timestamps: false,
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(footer);
  return { instance, initializeRelations };
}

module.exports = { defineFooter: defineFooter };
