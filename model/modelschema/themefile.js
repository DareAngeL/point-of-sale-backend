const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineTheme(sequelize) {
  const theme = sequelize.define(
    "themefile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: "recid",
      },
      primarycolor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      orderingbtnscolor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "themefile",
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

  const instance = new BaseModel(theme);
  return {instance, initializeRelations};
}

module.exports = {defineTheme: defineTheme};
