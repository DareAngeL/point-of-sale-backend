const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineOtherPayment(sequelize) {
  const otherpayment = sequelize.define(
    "paymentfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      paytyp: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
    },
    {
      tableName: "paymentfile",
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

  const instance = new BaseModel(otherpayment);
  return {instance, initializeRelations};
}

module.exports = {defineOtherPayment: defineOtherPayment};
