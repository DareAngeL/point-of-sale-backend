const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineItem(sequelize) {
  const item = sequelize.define(
    "itemfile",
    {
      recid: {
        type: DataTypes.BIGINT(20),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      itmcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmnum: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmdsc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmdscshort: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmdscforeign: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      barcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmtyp: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itmclacde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      itemsubclasscde: {
        type: DataTypes.STRING,
        allowNull: true,
        foreignKey: true,
      },
      locationcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      untmea: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      untcst: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      untprc: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      crilvl: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      itmpaxcount: {
        type: DataTypes.INTEGER(3),
        allowNull: false,
        defaultValue: "1",
      },
      taxcde: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      memc: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isaddon: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      inactive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      chkcombo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "itemfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["itmdsc"],
        },
        {
          fields: ["itmcde"],
        },
        {
          fields: ["itemsubclasscde"],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {
    const memc = modelList["memc"].instance.GetInstance();
    const posfile = modelList["posfile"].instance.GetInstance();
    const itemClass = modelList["itemclassification"].instance.GetInstance();
    const itemSubClass =
      modelList["itemsubclassification"].instance.GetInstance();

    item.hasOne(itemClass, {
      allowNull: true,
      constraints: false,
      foreignKey: "itmclacde",
      sourceKey: "itmclacde",
    });

    item.hasOne(itemSubClass, {
      allowNull: true,
      constraints: false,
      foreignKey: "itemsubclasscde",
      sourceKey: "itemsubclasscde",
    });

    item.hasMany(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "itmcde",
      sourceKey: "itmcde",
    });

    memc.hasMany(item, {
      allowNull: true,
      constraints: false,
      foreignKey: "memc",
      sourceKey: "code",
    })
    item.belongsTo(memc, {
      allowNull: true,
      constraints: false,
      foreignKey: "memc",
      targetKey: "code",
    })
  };

  const instance = new BaseModel(item);
  return {instance, initializeRelations};
}

module.exports = {defineItem: defineItem};
