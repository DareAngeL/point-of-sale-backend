const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineSpecialRequestGroup(sequelize) {
  const specialrequestgroup = sequelize.define(
    "modifiergroupfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      modgrpcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      modcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "modifiergroupfile",
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
    const itemsubclass = modelList["itemsubclassification"].instance.GetInstance();

    itemsubclass.hasMany(specialrequestgroup, {
      foreignKey: "modgrpcde",
      sourceKey: "itemsubclasscde"
    })
    specialrequestgroup.belongsTo(itemsubclass, {
      foreignKey: "modgrpcde",
      targetKey: "itemsubclasscde"
    })
  };

  const instance = new BaseModel(specialrequestgroup);
  return {specialrequestgroup, instance, initializeRelations};
}

module.exports = {defineSpecialRequestGroup: defineSpecialRequestGroup};
