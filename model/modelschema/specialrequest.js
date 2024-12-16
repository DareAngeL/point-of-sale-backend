const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineSpecialRequest(sequelize) {
  const specialrequest = sequelize.define(
    "modifierfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      modcde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      modgrpcde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "modifierfile",
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
    const specialrequestgroup =
      modelList["specialrequestgroup"].instance.GetInstance();

    specialrequest.hasMany(specialrequestgroup, {
      // as: "modifiergroupfile",
      allowNull: true,
      constraints: false,
      foreignKey: "modcde",
      sourceKey: "modcde",
    });
  };

  const instance = new BaseModel(specialrequest);
  return {instance, initializeRelations, sqlInstance: sequelize};
}

module.exports = {defineSpecialRequest: defineSpecialRequest};
