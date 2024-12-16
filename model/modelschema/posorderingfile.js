const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function definePosOrderingfile(sequelize) {
  const posfile = sequelize.define(
    "posorderingfile",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      docnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      trndte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      itmcde: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      itmdsc: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      itmqty: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      trncde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      untmea: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      factor: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0",
      },
      linenum: {
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValue: "0",
      },
      cuscde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      groprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      usrnam: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      logtim: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      logdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      netvatprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      exemptvat: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      disamt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      amtdis: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      untprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      groext: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      grossprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      extprc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      netvatamt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      vatamt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      vatrte: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      postrntyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cashier: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      disper: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      discde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      distyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      disqty: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      numpax: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      ordertyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      taxcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bankname: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cardtype: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cardclass: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      cardno: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      expdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      cardholder: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      billdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      freereason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ordercde: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      ordocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      approvalcode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      chkbnk: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      chkdte: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: "0001-01-01",
      },
      chknum: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      scharge: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      scharge_disc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      void: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "0",
      },
      customername: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tin: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      voidnum: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      batchnum: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      voidreason: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      orderitmid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      upload_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      postrmno: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      brhcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      terminalno: {
        type: DataTypes.INTEGER(10),
        allowNull: true,
      },
      trnsfrdte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      trnsfrtime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      memc: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "",
      },
      memc_value: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: 0,
      },
      postypcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      warcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      isaddon: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      mainitmcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      mainitmid: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      itmpaxcount: {
        type: DataTypes.INTEGER(3),
        allowNull: false,
        defaultValue: "1",
      },
      lessvat: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: 0,
      },
      vatexempt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      vatamtloc: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
      },
      itmcomcde: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      itmcomtyp: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      chkcombo: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      comboid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      voidqty: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      changed: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      peritem: {
        type: DataTypes.STRING(1),
        allowNull: true,
      },
      trnstat: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      nolessvat: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      govdisc: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      refund: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "0",
      },
      refnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      refundreason: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      refundqty: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      },
      forinv: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      refunddte: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      refundlogtim: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      itmnum: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },
      barcde: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      bnkcde: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      is_corrupted: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "0",
      },
      contactno: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      reprinted: {
        type: DataTypes.INTEGER(),
        allowNull: true,
        defaultValue: "0",
      },
      reprinted_amt: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: true,
        defaultValue: "0",
      }
    },
    {
      tableName: "posorderingfile",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
        {
          fields: ["ordercde"],
        },
        {
          fields: ["trndte", "logtim"],
        },
        {
          fields: ["postrntyp"],
        },
        {
          fields: ["batchnum"],
        },
        {
          fields: ["postrntyp", "batchnum"],
        },
        {
          fields: ["orderitmid"],
        },
        {
          fields: ["ordocnum"],
        },
        {
          fields: ["voidnum"],
        },
        {
          fields: ["refnum"],
        },
        {
          fields: ["extprc"],
        },
        {
          fields: ["groext"],
        },
        {
          fields: ["mainitmid"],
        },
        {
          fields: ["cashier", "trndte", "logtim"],
        },
        {
          fields: ['trnstat', 'is_corrupted', 'trnsfrdte'], 
        },
        {
          fields: ['docnum', 'trnsfrdte'], 
        },
        {
          fields: ['postrntyp', 'trndte'], 
        },
      ],
    }
  );

  const initializeRelations = (modelList) => {
    const item = modelList["item"].instance.GetInstance();
    const dinetype = modelList["dinetype"].instance.GetInstance();
    const cardType = modelList["cardtype"].instance.GetInstance();
    const memc = modelList["memc"].instance.GetInstance();
    const orderitemmodifierfile = modelList["specialrequestdetail"].instance.GetInstance();
    const pricedetail = modelList["pricedetail"].instance.GetInstance();
    const orderitemdiscountfile = modelList["orderitemdiscount"].instance.GetInstance();

    posfile.hasOne(item, {
      allowNull: true,
      constraints: false,
      foreignKey: "itmcde",
      sourceKey: "itmcde",
    });

    dinetype.hasMany(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "postypcde",
      sourceKey: "postypcde",
    });
    posfile.belongsTo(dinetype, {
      allowNull: true,
      constraints: false,
      foreignKey: "postypcde",
      targetKey: "postypcde",
    });

    cardType.hasMany(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "cardclass",
      sourceKey: "cardtype"
    })
    posfile.belongsTo(cardType, {
      allowNull: true,
      constraints: false,
      foreignKey: "cardclass",
      targetKey: "cardtype"
    })

    memc.hasMany(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "memc",
      sourceKey: "code"
    })
    posfile.belongsTo(memc, {
      allowNull: true,
      constraints: false,
      foreignKey: "memc",
      targetKey: "code"
    })

    posfile.hasMany(orderitemmodifierfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "orderitmid",
      sourceKey: "orderitmid"
    })
    orderitemmodifierfile.belongsTo(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "orderitmid",
      targetKey: "orderitmid"
    })

    posfile.hasOne(pricedetail, {
      allowNull: true,
      constraints: false,
      foreignKey: "itmcde",
      sourceKey: "itmcde",
    });
    pricedetail.belongsTo(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "itmcde",
      targetKey: "itmcde",
    });
    posfile.hasMany(orderitemdiscountfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "orderitmid",
      sourceKey: "orderitmid",
    })
    
    orderitemdiscountfile.belongsTo(posfile, {
      allowNull: true,
      constraints: false,
      foreignKey: "orderitmid",
      targetKey: "orderitmid"
    })

  };

  const instance = new BaseModel(posfile);
  return {instance, initializeRelations};
}

module.exports = {definePosOrderingfile: definePosOrderingfile};
