const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineMasterFileLog(sequelize) {
  const masterFileLog = sequelize.define(
    "pos_masterfile_log",
    {
      recid: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      tablename: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      filelog: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "pos_masterfile_log",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{name: "recid"}],
        },
        {
          name: "pos_masterfile_log_tablename",
          using: "BTREE",
          fields: [{name: "tablename"}],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {};

  const instance = new BaseModel(masterFileLog);
  return {instance, initializeRelations};
}

module.exports = {defineMasterFileLog: defineMasterFileLog};
