const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function definePriceDetail(sequelize) {
  const pricedetail = sequelize.define(
    "pricecodefile2",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      prccde: {
        type: DataTypes.STRING(30),
        allowNull: true,
        foreignKey: true,
      },
      itmcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmdsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      untmea: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      groprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      curcde: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      untcst: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      untprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      newuntprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      newgroprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      effctdte: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "pricecodefile2",
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

  const instance = new BaseModel(pricedetail);
  return {instance, initializeRelations};
}

module.exports = {definePriceDetail: definePriceDetail};
