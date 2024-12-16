const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineSales(sequelize) {
  const sales = sequelize.define(
    "salesfile1",
    {
      recid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      cancelrem: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      prttyp: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      warcde: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      x_gldepcde: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      colschdnum: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      totscpwdamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      totscpwdamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      docnum: {
        type: DataTypes.STRING(25),
        allowNull: true,
        unique: true,
      },
      cusdsc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      trmdsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      smndsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      shipto: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      trncde: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      trntot: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      smncde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      trmcde: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      cuscde: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      cusgrp: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      curcde: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      comcde: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      usrnam: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      currte: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      prccde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      sonum: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      shipto2: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      vatamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatrte: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      othchatot: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      textprc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      logtim: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      trmtypcde: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      trmtypdsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      othchatotfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      trntotfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      textprcfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      remarks: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      vat: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      ewtrte: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      taxcde: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      refnum: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      docapp: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      docbal: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      setdocbal: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      totpdc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      settotpdc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      amtapp: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      memtypcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      manualgl: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      ewtamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      pretaxamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      pretaxrte: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      netvatamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      ewtcde: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      docbalfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatableamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatexemptamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatzeroratedamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      nonvat: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      chknonvat: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      gainloss: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      manualvat: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      setdocbalfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      settotpdcfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      busstyle: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      remarks1: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      tinnum: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      canceldoc: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      vatamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      netvatamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatableamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatexemptamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatzeroratedamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      nonvatfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      orderby: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      projname: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      projsite: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      ra: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      sibill: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      billtype: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      siremarks: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      salesengr: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      preby: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      chkby: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      apvby: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      delconfnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      ffrom: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      chkasy: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      chkewt: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      totamtdis: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      totgroext: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      totamtdisfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      totgroextfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      netamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      netamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      ponum: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      increp: {
        type: DataTypes.STRING(1),
        allowNull: true,
      },
      pcknum: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      cusgrpcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      cusadd1: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      cusadd2: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field01: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field02: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field03: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field04: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field05: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field06: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field07: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field08: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field09: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field10: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field11: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field12: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field13: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field14: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field15: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field16: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field17: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field18: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field19: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      field20: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      manualewt: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      bilnum: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      doclock: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: "N",
      },
      bnkcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      chknum: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      voudocnum: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      trndte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      duedate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      logdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      lastpaydte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      canceldte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      radte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      aprdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      drdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      chkevat: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      evatcde: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      evatrte: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      evatamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      manualevat: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      advdoc: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      gldepcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      drnum: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      From: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "From",
      },
      paydoc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      vattyp: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      tableName: "salesfile1",
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

  const instance = new BaseModel(sales);
  return {instance, initializeRelations};
}

module.exports = {defineSales: defineSales};
