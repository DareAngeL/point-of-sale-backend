const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineMallHookupFile(sequelize) {
  const mallhookupfile = sequelize.define('mallhookupfile', {
    recid: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    mallname: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mallhookupfile',
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
    ]
  });

  const initializeRelations = (modelList) => {
    mallhookupfile.hasMany(
      modelList.mallhookupfile2.instance.GetInstance(), 
      { as: "mallfields", foreignKey: "mall_id", sourceKey: "recid" }
    );

    modelList.mallhookupfile2.instance.GetInstance().belongsTo(
      mallhookupfile, 
      { as: "mallhookupfile", foreignKey: "mall_id", targetKey: "recid" }
    );
  };

  const instance = new BaseModel(mallhookupfile);
  return {instance, initializeRelations};
}

module.exports = {defineMallHookupFile: defineMallHookupFile};
