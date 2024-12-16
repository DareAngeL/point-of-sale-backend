const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineUserfile(sequelize) {
  const users = sequelize.define(
    "pos_userfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        unique: "recid",
      },
      usrcde: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      usrname: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      usrpwd: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      usrtyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      receive_zreading: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      approver: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      prntrange: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      cardholder: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cardno: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "pos_userfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["cardno", "cardholder"],
        },
        {
          fields: ["usrcde"],
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {
    const useraccess = modelList["useraccess"].instance.GetInstance();

    users.hasMany(useraccess, {
      allowNull: true,
      constraints: false,
      foreignKey: "usrcde",
      sourceKey: "usrcde",
    });
  };

  const instance = new BaseModel(users);
  return {instance, initializeRelations};
}

module.exports = {defineUserfile: defineUserfile};
