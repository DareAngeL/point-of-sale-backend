const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineItemsubclassification(sequelize) {
  const itemSubclassification = sequelize.define(
    "itemsubclassfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
      },
      itemsubclasscde: {
        type: DataTypes.STRING,
        allowNull: true,
        primaryKey: true,
      },
      itemsubclassdsc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmclacde: {
        type: DataTypes.STRING,
        allowNull: true,
        foreignKey: true,
      },
      locationcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      hide_subclass: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "itemsubclassfile",
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
    const item = modelList["item"].instance.GetInstance();
    const location = modelList["locationfile"].instance.GetInstance();

    itemSubclassification.hasMany(item, {
      foreignKey: "itemsubclasscde",
      sourceKey: "itemsubclasscde",
    });

    item.belongsTo(itemSubclassification, {
      foreignKey: "itemsubclasscde",
      targetKey: "itemsubclasscde",
    });

    location.hasMany(itemSubclassification, {
      foreignKey: "locationcde",
      sourceKey: "locationcde"
    })
    itemSubclassification.belongsTo(location, {
      foreignKey: "locationcde",
      targetKey: "locationcde"
    })
    // itemSubclassification.hasOne(itemClassification, {
    //   foreignKey: "itmclacde",
    //   targetKey: "itmclacde",
    // })

    // itemClassification.belongsTo()

  };

  const instance = new BaseModel(itemSubclassification);
  return {instance, initializeRelations};
}

module.exports = {defineItemsubclassification: defineItemsubclassification};
