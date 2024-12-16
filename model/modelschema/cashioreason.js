const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineCashIOReason(sequelize) {
  const cashIOReason = sequelize.define(
    "cashioreasonfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      cashioreason: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
    },
    {
      tableName: "cashioreasonfile",
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

  const instance = new BaseModel(cashIOReason);
  return {instance, initializeRelations};
}

module.exports = {defineCashIOReason: defineCashIOReason};
