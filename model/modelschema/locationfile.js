const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineLocationfile(sequelize) {
  const locationfile = sequelize.define(
    "locationfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      printername: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      terminalip: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      locationcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
        primaryKey: true,
      },
      locationdsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
        // unique: 'locationdsc'
      },
      printertype: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      printersize: {
        type: DataTypes.INTEGER(5),
        allowNull: true,
      },
      lastmod: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isSticker: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
        field: "isSticker",
      },
      stckheight: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: "0",
      },
      stckwidth: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: "0",
      },
      stckfontsize: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: "0",
      },
    },
    {
      tableName: "locationfile",
      timestamps: false,
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(locationfile);
  return {instance, initializeRelations};
}

module.exports = {defineLocationfile: defineLocationfile};
