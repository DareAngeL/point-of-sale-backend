const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");


function defineSalesReturnfile1(sequelize) {
  const salesreturnfile1 = sequelize.define('salesreturnfile1', {
    recid: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      comment: "MODIFIED BY DareAngeLPoco ON 17.12.13 11:59"
    },
    cancelrem: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    warcde: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    x_gldepcde: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "Rename to x_ BY DareAngeLPoco ON 17.12.13 11:58"
    },
    cusgrpcde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    totscpwdamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    totscpwdamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    docnum: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17",
      unique: "docnum"
    },
    cusdsc: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    trmdsc: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    smndsc: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    shipto: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    trncde: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    trntot: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    smncde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:17"
    },
    trmcde: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    cuscde: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    cusgrp: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    curcde: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    comcde: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    usrnam: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    currte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    prccde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    cmnum: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    refnum: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    textprc: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    logtim: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    trntotfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    textprcfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    remarks: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    taxcde: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    ewtamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    pretaxamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    pretaxrte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    netvatamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    ewtcde: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    ewtrte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatrte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatableamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatexemptamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatzeroratedamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    nonvat: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    chknonvat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    manualvat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    canceldoc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    netvatamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatableamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatexemptamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    vatzeroratedamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    nonvatfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    chkewt: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    totamtdis: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    totgroext: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    totamtdisfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    totgroextfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    netamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    netamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    orderby: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    projname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    projsite: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:18"
    },
    ra: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    sibill: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    billtype: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    siremarks: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    salesengr: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    preby: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    chkby: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    apvby: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    delconfnum: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    ffrom: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field01: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field02: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field03: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field04: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field05: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field06: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field07: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field08: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field09: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field10: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field11: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field12: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field13: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field14: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field15: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field16: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field17: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field18: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field19: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    field20: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    doclock: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "N",
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    trndte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    duedate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    logdte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    canceldte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    radte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    aprdte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    bilnum: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    chkevat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    evatcde: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    evatrte: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    evatamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    manualevat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    advdoc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    cusadd1: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    cusadd2: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    brhcde: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    gldepcde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "MODIFIED BY DareAngeLPoco ON 17.12.13 11:58"
    },
    From: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    shipto2: {
      type: DataTypes.CHAR(150),
      allowNull: true
    },
    vattyp: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salesreturnfile1',
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
        name: "docnum",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "docnum" },
        ]
      },
    ]
  });

  const initializeRelations = () => {};

  const instance = new BaseModel(salesreturnfile1);
  return {instance, initializeRelations};
}

module.exports = {defineSalesReturnfile1: defineSalesReturnfile1};
