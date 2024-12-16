const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineCompany(sequelize) {
  const company = sequelize.define(
    "companyfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      comdsc: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      comcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "companyfile",
      timestamps: false,
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(company);
  return {instance, initializeRelations};
}

module.exports = {defineCompany: defineCompany};
