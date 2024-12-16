// path/to/your/model/file
const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineForFtpFile(sequelize) {
  const forftpfile = sequelize.define(
    "forftpfile",
    {
      batchnum: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      batchno: {
        type: DataTypes.INTEGER(10),
        allowNull: false,
        defaultValue: 0,
      },
      curreod: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        defaultValue: 0,
      },
      currgtot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      datesent: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: "0001-01-01 00:00:00",
      },
      disadisc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gross: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      grossperrent: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      localtax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      misc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      nonpharma: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      noofdisc: {
        type: DataTypes.INTEGER(6),
        allowNull: false,
        defaultValue: 0,
      },
      noofrec: {
        type: DataTypes.INTEGER(6),
        allowNull: false,
        defaultValue: 0,
      },
      noofref: {
        type: DataTypes.INTEGER(6),
        allowNull: false,
        defaultValue: 0,
      },
      noofreprint: {
        type: DataTypes.INTEGER(16),
        allowNull: false,
        defaultValue: 0,
      },
      noofvoid: {
        type: DataTypes.INTEGER(6),
        allowNull: false,
        defaultValue: 0,
      },
      novelty: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      otherneg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      pharma: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      postrmno: {
        type: DataTypes.INTEGER(2),
        allowNull: true,
      },
      preveod: {
        type: DataTypes.INTEGER(5),
        allowNull: false,
        defaultValue: 0,
      },
      prevgtot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      salesdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tenantid: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      totamtdisc: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totamtref: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totamtreprint: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totamtvoid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
      },
      totcredsales: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totcredtax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totnonvat: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      totservchrge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      tottax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
    },
    {
      tableName: "forftpfile",
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

  const instance = new BaseModel(forftpfile);
  return { instance, initializeRelations };
}

module.exports = { defineForFtpFile: defineForFtpFile };
