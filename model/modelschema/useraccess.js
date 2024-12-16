const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineUserAccess(sequelize) {
  const useraccess = sequelize.define(
    "useraccessfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      usrcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      menfield: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      allowadd: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowedit: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowvoid: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowprint: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowdelete: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowimport: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allowresend: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
    },
    {
      tableName: "useraccessfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
      ],
    }
  );
  const initializeRelations = () => {};

  const instance = new BaseModel(useraccess);
  return {instance, initializeRelations};
}

module.exports = {defineUserAccess: defineUserAccess};
