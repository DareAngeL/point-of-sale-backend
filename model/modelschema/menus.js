const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineMenus(sequelize) {
  const menus = sequelize.define(
    "pos_menus",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      menfield: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mencap: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      usrtyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mengrp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
      },
      allowadd: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowedit: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowprint: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowvoid: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowdelete: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowresend: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowimport: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
    },
    {
      tableName: "pos_menus",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["mengrp", "mencap"],
        },
      ],
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(menus);
  return {instance, initializeRelations};
}

module.exports = {defineMenus: defineMenus};
