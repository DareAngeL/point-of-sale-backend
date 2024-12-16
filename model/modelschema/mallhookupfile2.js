const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineMallhookupFile2(sequelize) {
  const mallhookupfile2 = sequelize.define('mallhookupfile2', {
    recid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mall_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'mallhookupfile',
        key: 'recid'
      }
    },
    input_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    label: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_select: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
  }, {
    sequelize,
    tableName: 'mallhookupfile2',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "recid" },
        ]
      },
      {
        name: "mall_id",
        using: "BTREE",
        fields: [
          { name: "mall_id" },
        ]
      },
    ]
  });

  const initializeRelations = () => {};

  const instance = new BaseModel(mallhookupfile2);
  return {instance, initializeRelations};
}

module.exports = {defineMallhookupFile2: defineMallhookupFile2};