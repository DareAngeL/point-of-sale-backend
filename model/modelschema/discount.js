const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineDiscount(sequelize) {
  const discount = sequelize.define(
    "discountfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      chkpos: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      disamt: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
      },
      discde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disdsc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disper: {
        type: DataTypes.DECIMAL,
        defaultValue: 0,
        allowNull: true,
      },
      distyp: {
        type: DataTypes.STRING,
        defaultValue: 0,
      },
      exemptvat: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nolessvat: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      govdisc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      hookupdisc: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      scharge: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      online_deals: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      disshrtdsc: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
    },
    {
      tableName: "discountfile",
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

  const instance = new BaseModel(discount);
  return {instance, initializeRelations};
}

module.exports = {defineDiscount: defineDiscount};
