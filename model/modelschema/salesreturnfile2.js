const { DataTypes } = require("sequelize");
const { BaseModel } = require("..");

function defineSalesReturnfile2(sequelize) {
  const salesreturnfile2 = sequelize.define('salesreturnfile2', {
    recid: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    srtrem: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:19"
    },
    itmstacde: {
      type: DataTypes.STRING(30),
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
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field06: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field07: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field08: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field09: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field10: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field11: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field12: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field13: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field14: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field15: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field16: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field17: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field18: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field19: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    field20: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    PckItmCde: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    cusgrpcde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    scpwddis: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    scpwdamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    scpwdamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    docnum: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    cusdsc: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    itmcde: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    itmdsc: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    itmqty: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    untprc: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    extprc: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    trncde: {
      type: DataTypes.STRING(3),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    untmea: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    prcdst1: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    prcdst2: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    prcdst3: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    wardsc: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    factor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    linenum: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    cuscde: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    warcde: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    groprc: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    prccde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    cstdsta: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    cstoth: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    disamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    conver1: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    smncde: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    smndsc: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:20"
    },
    logtim: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    usrnam: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    curcde: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    currte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    disamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    untprcfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    groprcfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    extprcfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    untcst: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    extcst: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    sernum: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    disper: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    lstcst: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    extlst: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    avecst: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    extave: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    fifcst: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    extfif: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    itmtyp: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    ewtcde: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    ewtrte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    evatcde: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    evatrte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    netvatamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    taxcde: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    vatamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    vatrte: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    ewtamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    evatamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    netvatamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    vatamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    amtdis: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000
    },
    groext: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    amtdisfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    groextfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true,
      defaultValue: 0.00000,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    itmrem1: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    itmrem2: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    itmrem3: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    refnum: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    dettyp: {
      type: DataTypes.STRING(1),
      allowNull: true,
      defaultValue: "i",
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    trndte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    logdte: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    cmnum: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: "ADDED BY DareAngeLPoco ON 16.09.30 20:21"
    },
    barcodenum: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    brhcde: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    batchnum: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    expdte: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    mfgdte: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    barcde: {
      type: DataTypes.STRING(35),
      allowNull: true
    },
    discamt: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true
    },
    discamtfor: {
      type: DataTypes.DECIMAL(18,5),
      allowNull: true
    },
    disccde: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    discper: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    vattyp: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'salesreturnfile2',
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

  const initializeRelations = () => {};

  const instance = new BaseModel(salesreturnfile2);
  return {instance, initializeRelations};
}

module.exports = {defineSalesReturnfile2: defineSalesReturnfile2};