const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineTimelogfile(sequelize) {
  const timelogfile = sequelize.define(
    "timelogfile",
    {
      recid: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      trndte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      timestart: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      timeend: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      is_generated: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "timelogfile",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "recid" }],
        },
      ],
    }
  );
  const initializeRelations = () => {};

  const instance = new BaseModel(timelogfile);
  return { instance, initializeRelations };
}

module.exports = { defineTimelogfile: defineTimelogfile };
