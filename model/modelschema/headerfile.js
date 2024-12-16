const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineHeaderfile(sequelize) {
  const headerfile = sequelize.define(
    "headerfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      business1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      business2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      business3: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      taxpayer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tin: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address3: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      serialno: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      machineno: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tenantid: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      postrmno: {
        type: DataTypes.INTEGER(2),
        allowNull: true,
      },
      brcode: {
        type: DataTypes.STRING(17),
        allowNull: true,
      },
      storno: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ncheck: {
        type: DataTypes.STRING(17),
        allowNull: true,
      },
      classc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      comdsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      comcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      brhdsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pos_machineno: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      chknonvat: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "0",
      },
      storcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tenantnam: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tenantcomcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bnkcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      warcde: {
        type: DataTypes.STRING(30),
        allowNull: true
      }
      // sales_type: {
      //   type: DataTypes.STRING(100),
      //   allowNull: true,
      // },
    },
    {
      tableName: "headerfile",
      timestamps: false,
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(headerfile);
  return { instance, initializeRelations };
}

module.exports = { defineHeaderfile: defineHeaderfile };
