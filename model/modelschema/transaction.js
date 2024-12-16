const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineTransaction(sequelize) {
  const transaction = sequelize.define(
    "takeouttranfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        unique: "recid",
        primaryKey: true,
      },
      tabletrncde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ordercde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cusdsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      opentime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      closetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      postypcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      warcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      paxcount: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
    },
    {
      tableName: "takeouttranfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["ordercde"],
        },
        {
          fields: ["tabletrncde"],
        },
      ],
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(transaction);
  return {instance, initializeRelations};
}

module.exports = {defineTransaction: defineTransaction};
