const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function definePricelist2(sequelize) {
  const pricelist = sequelize.define(
    "pricecodefile3",
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
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      postypcde: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "pricecodefile3",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {
    const pricedetail = modelList["pricedetail"].instance.GetInstance();

    pricelist.hasMany(pricedetail, {foreignKey: "prccde", sourceKey: "prccde"});
    pricedetail.belongsTo(pricelist, {
      foreignKey: "prccde",
      targetKey: "prccde",
    });
  };

  const instance = new BaseModel(pricelist);
  return {instance, initializeRelations};
}

module.exports = {definePricelist2: definePricelist2};
