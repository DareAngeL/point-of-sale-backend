const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function definePricelist(sequelize) {
  const pricelist = sequelize.define(
    "pricecodefile1",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      prcdte: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      prccde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      prcdsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      // ordertyp: {
      //   type: DataTypes.STRING(50),
      //   allowNull: true,
      // },
      postypcde: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "pricecodefile1",
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
    const dinetype = modelList["dinetype"].instance.GetInstance();
    const transaction = modelList["transaction"].instance.GetInstance();

    dinetype.hasMany(pricelist, {foreignKey: "postypcde", sourceKey: "postypcde"});
    pricelist.belongsTo(dinetype, {
      foreignKey: "postypcde",
      targetKey: "postypcde",
    });
    pricelist.hasMany(pricedetail, {foreignKey: "prccde", sourceKey: "prccde"});
    pricedetail.belongsTo(pricelist, {
      foreignKey: "prccde",
      targetKey: "prccde",
    });
    pricelist.hasMany(transaction, {
      foreignKey: "warcde",
      sourceKey: "prccde",
    })
    transaction.belongsTo(pricelist, {
      foreignKey: "warcde",
      targetKey: "prccde"
    })
  };

  const instance = new BaseModel(pricelist);
  return {instance, initializeRelations};
}

module.exports = {definePricelist: definePricelist};
