const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineTerminal(sequelize) {
  const terminal = sequelize.define(
    "terminalfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        unique: "recid",
      },
      terminalname: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      terminalip: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "terminalfile",
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

  const instance = new BaseModel(terminal);
  return {instance, initializeRelations};
}

module.exports = {defineTerminal: defineTerminal};
