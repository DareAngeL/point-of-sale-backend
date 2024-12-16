const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineZReadingFile(sequelize) {
  const zreadingfile = sequelize.define(
    "zreadingfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      trndte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      grosssal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      lesspostvoid: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      lesspostrefund: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      lessdicount: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      lesscharge: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      lessvat: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      netsalwvat: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      netsalwovat: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      totvatsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      vatamt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      localtax: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      totvatexempt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      tottran: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      totqty: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      govdisc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      regdisc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      scpwddisc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      cashsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      cashin: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      cashout: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      cashfund: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      cashdrawer: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      poscash: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      declaration: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      shortover: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      excess: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      othermop: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      totpax: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      cardsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      debitsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      creditsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      begor: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      endor: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      zcounter: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      begsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      endsal: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      prevtottran: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
    },
    {
      tableName: "zreadingfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["trndte"],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {};

  const instance = new BaseModel(zreadingfile);
  return {instance, initializeRelations};
}

module.exports = {defineZReadingFile: defineZReadingFile};
