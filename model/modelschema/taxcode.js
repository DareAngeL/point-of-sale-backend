const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineTaxCode(sequelize) {
  const taxcode = sequelize.define(
    "taxcodefile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      taxcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      taxper: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0",
      },
      taxtyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "taxcodefile",
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

  const instance = new BaseModel(taxcode);
  return {instance, initializeRelations};
}

module.exports = {defineTaxCode: defineTaxCode};
