const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineItemClassification(sequelize) {
  const itemClassification = sequelize.define(
    "itemclassfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      itmclacde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmcladsc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      locationcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inactive_class: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      tableName: "itemclassfile",
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
    const itemSubclassification =
      modelList["itemsubclassification"].instance.GetInstance();
    const location = modelList["locationfile"].instance.GetInstance();

    itemClassification.hasMany(itemSubclassification, {
      foreignKey: "itmclacde",
      sourceKey: "itmclacde",
    });
    itemSubclassification.belongsTo(itemClassification, {
      foreignKey: "itmclacde",
      targetKey: "itmclacde",
    });

    location.hasMany(itemClassification, {
      foreignKey: "locationcde",
      sourceKey: "locationcde"
    })
    itemClassification.belongsTo(location, {
      foreignKey: "locationcde",
      targetKey: "locationcde"
    })
  };

  const instance = new BaseModel(itemClassification);
  return {instance, initializeRelations};
}

module.exports = {defineItemClassification: defineItemClassification};
