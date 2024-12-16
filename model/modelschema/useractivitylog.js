const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineUserActivityLog(sequelize) {
  const useractivitylog = sequelize.define(
    "useractivitylogfile",
    {
      recid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      usrname: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      usrcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      trndte: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      method: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "useractivitylogfile",
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

  const instance = new BaseModel(useractivitylog);
  return {instance, initializeRelations};
}

module.exports = {defineUserActivityLog: defineUserActivityLog};
