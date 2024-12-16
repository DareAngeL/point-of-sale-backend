const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineCardType(sequelize) {
  const cardType = sequelize.define(
    "cardtypefile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      cardtype: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
    },
    {
      tableName: "cardtypefile",
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

  const instance = new BaseModel(cardType);
  return {instance, initializeRelations};
}

module.exports = {defineCardType: defineCardType};
