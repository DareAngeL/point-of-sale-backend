const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineSalesDetail(sequelize) {
  const salesdetail = sequelize.define(
    "salesfile2",
    {
      recid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      linegrp: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      chkasy: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
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
      PckItmCde: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "PckItmCde",
      },
      copyline: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      scpwddis: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      scpwdamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      scpwdamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      docnum: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      cusdsc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      itmcde: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      itmdsc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      itmqty: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      untprc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      extprc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      trncde: {
        type: DataTypes.STRING(3),
        allowNull: true,
      },
      untmea: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      prcdst1: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      prcdst2: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      prcdst3: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      wardsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      factor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      linenum: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      cuscde: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      warcde: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      groprc: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      prccde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      sonum: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      disamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      conver1: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      smncde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      smndsc: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      usrnam: {
        type: DataTypes.STRING(20),
        allowNull: true,
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
      curcde: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      currte: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      disamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      untprcfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      groprcfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      extprcfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      untcst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      extcst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      sernum: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      drnum: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      disper: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      lstcst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      extlst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      avecst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      extave: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      fifcst: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      extfif: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      itmtyp: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      netvatamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      taxcde: {
        type: DataTypes.STRING(15),
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
      ewtamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      evatamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      ewtcde: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      ewtrte: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      evatcde: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      evatrte: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      itmrem1: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      itmrem2: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      itmrem3: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      netvatamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      vatamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      chkewt: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      amtdis: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      groext: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      amtdisfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      groextfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      refnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      increp: {
        type: DataTypes.STRING(1),
        allowNull: true,
      },
      cusgrpcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      cusitmcde: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      dettyp: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: "i",
      },
      trndte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      logdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      drdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      copyqty: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      barcodenum: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      brhcde: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      batchnum: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      expdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      mfgdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      barcde: {
        type: DataTypes.STRING(35),
        allowNull: true,
      },
      discamt: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0.00000",
      },
      discamtfor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      disccde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      discper: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      ponum: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      vattyp: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
    },
    {
      tableName: "salesfile2",
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

  const instance = new BaseModel(salesdetail);
  return {instance, initializeRelations};
}

module.exports = {defineSalesDetail: defineSalesDetail};
