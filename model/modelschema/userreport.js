const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineUserReport(sequelize) {
  const userreport = sequelize.define(
    "userreportfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      usercde: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      report: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "userreportfile",
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

  const instance = new BaseModel(userreport);
  return {instance, initializeRelations};
}

module.exports = {defineUserReport: defineUserReport};
