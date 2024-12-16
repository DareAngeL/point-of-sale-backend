const { _log } = require("../../helper");
const { round2decimal } = require("../../helper/decimal");
const { modelList } = require("../model");
const { computeTotal } = require("./compute_total");

const addDiscounts = async (bulkOrderItem) => {

  console.log("bulk:", bulkOrderItem);

  // const posfile = modelList.posfile.instance.GetInstance();
  const posfile = modelList.posorderingfile.instance.GetInstance();
  const syspar = modelList.systemparameters.instance.GetInstance();
  const transaction = modelList.transaction.instance.GetInstance();
  const discountSearch = modelList.discount.instance;

  const findSyspar = await syspar.findOne({});
  const openTran = await transaction.findOne({where: {status: "OPEN"}});
  const recallTran = await transaction.findOne({where: {status: "RECALL"}});

  const findLessVatAdj = await posfile.findOne({
    where: {
      postrntyp: "Less Vat Adj.",
      ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
    },
  });
  const posfileTotal = await posfile.findOne({
    where: {
      postrntyp: "TOTAL",
      ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
    },
  });

  const orderItemsWithDiscounts = await Promise.all(
    bulkOrderItem.map(async (oi) => {
      const findPosfile = await posfile.findOne({
        where: {orderitmid: oi.orderitmid},
        raw: true,
      });

      let _discountedPrice = 0;
      let _lessVat = 0;
      let _vatexempt = 0;
      let _vatamt = 0;
      let _netvatamt = 0;
      let _discount = 0;
      let _govdisc = 0;
      const findDiscount = await discountSearch.GetInstance().findOne({
        where: {
          discde: oi.discde,
        },
      });
      const paxCount = openTran.paxcount;

      if (findPosfile.taxcde == "VATABLE") {
        const { 
          vatexempt, discountedPrice,
          lessVat, discount, netvatamt,
          vatamt, govdisc
         } = calculateVATABLE(
          oi, _vatexempt,
          findPosfile, paxCount,
          findSyspar, _govdisc,
          _lessVat, _discountedPrice,
          _discount, findDiscount,
          posfileTotal, _netvatamt, _vatamt
        );

        _vatexempt = vatexempt;
        _discountedPrice = discountedPrice;
        _lessVat = lessVat;
        _discount = discount;
        _netvatamt = netvatamt;
        _vatamt = vatamt;
        _govdisc = govdisc;
      } else if (findPosfile.taxcde == "VAT EXEMPT") {
        const {
          vatexempt, discountedPrice,
          lessVat, discount,
          netvatamt, vatamt, govdisc
        } = calculateVATEXEMPT(
          oi, _vatexempt,
          findPosfile, paxCount,
          _govdisc, _lessVat,
          _discountedPrice, _discount,
          _netvatamt, _vatamt
        );

        _vatexempt = vatexempt;
        _discountedPrice = discountedPrice;
        _lessVat = lessVat;
        _discount = discount;
        _netvatamt = netvatamt;
        _vatamt = vatamt;
        _govdisc = govdisc;
      }

      let discountWithoutMemc = 0;
      let discountWithMemc = 0;
      let origPrice = 0;

      switch (findDiscount.dataValues.distyp) {
        case "Percent":
          
          discountWithoutMemc = _discount;
          // tinaggal ko ang paxcount since as per sir adrian, hindi daw dapat i-divide pag naka memc
          discountWithMemc =
            (oi.disper / 100) *
            (parseFloat(findPosfile.memc_value) / (1 + findSyspar.vatrte / 100))

          break;
        case "Amount":
          
          discountWithoutMemc = _discount;
          discountWithMemc =
            (oi.disamt / 100) *
            (parseFloat(findPosfile.memc_value) / (1 + findSyspar.vatrte / 100))

          break;
        default:
          break;
      }

      if (hasMEMC(findPosfile, posfileTotal)) {
        origPrice += findPosfile.extprc - discountWithMemc - _lessVat;
      }

      return [{
        // for posfile table
        ...findPosfile,
        extprc: origPrice > 0 ? round2decimal(origPrice) : round2decimal(_discountedPrice),
        amtdis:
        round2decimal(parseFloat(findPosfile.amtdis)) + (hasMEMC(findPosfile, posfileTotal)
            ? round2decimal(discountWithMemc)
            : round2decimal(discountWithoutMemc)),
        disamt:
        round2decimal(parseFloat(findPosfile.disamt)) + (hasMEMC(findPosfile, posfileTotal)
            ? round2decimal(discountWithMemc)
            : round2decimal(discountWithoutMemc)),
        lessvat: round2decimal(parseFloat(findPosfile.lessvat) + _lessVat),
        vatexempt: round2decimal(_vatexempt),
        vatamt: round2decimal(_vatamt),
        netvatamt: round2decimal(_netvatamt),
      }, {
        // for orderitemdiscountfile table
        rawDiscount: hasMEMC(findPosfile, posfileTotal)
          ? round2decimal(discountWithMemc)
          : round2decimal(discountWithoutMemc),
        rawLessVat: _lessVat,
      }];
    })
  );

  await posfile.bulkCreate(orderItemsWithDiscounts.map(d => d[0]), {
    updateOnDuplicate: [
      "groext",
      "untprc",
      "disamt",
      "grossprc",
      "groprc",
      "extprc",
      "lessvat",
      "vatexempt",
      "vatamt",
      "netvatamt",
      "amtdis"
    ],
  });

  await computeTotal(posfile, {
    postrntyp: "ITEM",
    ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
    // itmcomtyp: null,
  });

  return orderItemsWithDiscounts.map((d) => {

    return {
      orderitmid: d[0].orderitmid,
      itmcde: d[0].itmcde,
      discount: d[1].rawDiscount,
      lessvat: d[1].rawLessVat,
      vatexempt: d[0].vatexempt,
      ordocnum: d[0].ordocnum
    };
  });
};

const calculateVATABLE = (
  oi, vatexempt,
  findPosfile, paxCount,
  findSyspar, govdisc,
  lessVat, discountedPrice,
  discount, findDiscount,
  posfileTotal, netvatamt,
  vatamt
) => {

  const exemptVAT = () => {
    const extprcForVatExempt = hasMEMC(findPosfile, posfileTotal) ? findPosfile.memc_value : findPosfile.groext;
    vatexempt = extprcForVatExempt / paxCount / (1 + findSyspar.vatrte / 100);

    netvatamt = hasMEMC(findPosfile, posfileTotal) ? 
      (findPosfile.extprc - findPosfile.memc_value) / paxCount / (1 + findSyspar.vatrte / 100) 
      : 
      netvatamt;

    vatamt = hasMEMC(findPosfile, posfileTotal) ? 
      ((findPosfile.extprc - findPosfile.memc_value) / paxCount) *
      (1 - 1 / (1 + findSyspar.vatrte / 100))
      :
      vatamt


    // const nolessvat =
    //   typeof oi.nolessvat !== "number"
    //     ? Number(oi.nolessvat)
    //     : oi.nolessvat;
    // govdisc =
    //   typeof oi.govdisc !== "number" ? Number(oi.govdisc) : oi.govdisc;

    const nolessvat = 1;

    const totalPrice = 
      (findPosfile.changed === 1 ? findPosfile.extprc : findPosfile.untprc * findPosfile.itmqty);

    if (nolessvat === 0) {
      if (govdisc === 1) {
        const memc = parseFloat(findPosfile.memc_value);

        lessVat = hasMEMC(findPosfile, posfileTotal) ?
          memc * (1 - 1 / (1 + findSyspar.vatrte / 100))
        :
        totalPrice *
          (1 - 1 / (1 + findSyspar.vatrte / 100));

        discount =
          (totalPrice / paxCount) * (oi.disper / 100);

        discountedPrice = findPosfile.extprc - discount - lessVat;

      } else {
        discount =
          (totalPrice / paxCount) * (oi.disper / 100);

        discountedPrice =
          findPosfile.extprc - discount - lessVat;
      }
      
    } else if (oi.discde === "Diplomat") {
      const memc = parseFloat(findPosfile.memc_value);
      
      lessVat = hasMEMC(findPosfile, posfileTotal) ?
          memc * (1 - 1 / (1 + findSyspar.vatrte / 100))
        :
          (totalPrice / paxCount) *
          (1 - 1 / (1 + findSyspar.vatrte / 100));

      discountedPrice = findPosfile.extprc - lessVat;
      // discountedPrice =
      //   findPosfile.extprc / (1 + findSyspar.vatrte / 100);
      
    } else {
      // if (govdisc === 1) {
      //   discountedPrice =
      //     findPosfile.extprc * findPosfile.itmqty -
      //     (oi.disper / 100) * vatexempt;
      // } else {

      // government to
      // VATABLE / nolessvat = 1 / 

      switch (findDiscount.dataValues.distyp) {
        case "Amount":
          discount = oi.disamt;
          break;
        case "Percent": {
          const vat = (1 + findSyspar.vatrte / 100);
          discount = ((totalPrice / paxCount) / vat) * (oi.disper / 100);
          break;
        }
        default:
          break;
      }
      
      if (hasMEMC(findPosfile, posfileTotal)) {
        const memc = parseFloat(findPosfile.memc_value);
        lessVat = memc - memc / 1.12;
      } else {
        const priceDividedByPaxCount = totalPrice / paxCount;
        lessVat = priceDividedByPaxCount - priceDividedByPaxCount / 1.12;
      }

      discountedPrice = findPosfile.extprc - discount - lessVat;
      // netvatamt = findPosfile.extprc / 1.12;
    }

    return {
      vatexempt,
      discountedPrice,
      lessVat,
      discount,
      netvatamt,
      vatamt,
      govdisc,
    }
  }

  const nonExempVAT = () => {
    // exempvat === N
    vatamt =
      (findPosfile.extprc / paxCount) *
      (1 - 1 / (1 + findSyspar.vatrte / 100));
    netvatamt =
      findPosfile.extprc /
      paxCount /
      (1 + findSyspar.vatrte / 100);

    const nolessvat =
      typeof oi.nolessvat !== "number"
        ? Number(oi.nolessvat)
        : oi.nolessvat;
    govdisc =
      typeof oi.govdisc !== "number" ? Number(oi.govdisc) : oi.govdisc;

    const totalPrice = 
      (findPosfile.changed === 1 ? findPosfile.extprc : findPosfile.untprc * findPosfile.itmqty);

    if (nolessvat == 0) {

      switch (findDiscount.dataValues.distyp) {
        case "Amount":
          discount = oi.disamt;
          discountedPrice = findPosfile.extprc - discount;
          break;
        case "Percent":
          // discount =
          //   (oi.disper / 100) *
          //   ((findPosfile.extprc * findPosfile.itmqty) /
          //     paxCount /
          //     (1 + findSyspar.vatrte / 100));

          // discountedPrice =
          // findPosfile.extprc - (oi.disper / 100) * netvatamt;

          discount = hasMEMC(findPosfile, posfileTotal) ? 
            (oi.disper / 100) * (parseFloat(findPosfile.memc_value) / (1 + findSyspar.vatrte / 100))
            :
            (oi.disper / 100) * (totalPrice / paxCount);

          console.log(discount, "GEGE");

          discountedPrice = findPosfile.extprc - discount;

          break;
        default:
          break;
      }

      if (oi.discde === "Athlete") {
        discount = (((totalPrice / paxCount) / 1.12) * oi.disper) / 100;
        discountedPrice = findPosfile.extprc - discount;
        netvatamt = findPosfile.extprc / 1.12;
        vatamt = findPosfile.extprc * (1 - 1 / (1 + findSyspar.vatrte / 100));
      }
      else{
        netvatamt = discountedPrice / (1 + findSyspar.vatrte / 100);
      }


      // if (oi.discde === "MOV") {
      //   netvatamt = 0;
      // }
      
    } else if (nolessvat == 1) {
      // non government

      switch (findDiscount.dataValues.distyp) {
        case "Amount":
          discount = oi.disamt;
          break;
        case "Percent": {
          discount = ((totalPrice / paxCount) * oi.disper) / 100;

          break;
        }
        default:
          break;
      }

      discountedPrice = findPosfile.extprc - discount;
      netvatamt = discountedPrice / (1 + findSyspar.vatrte / 100);
      vatamt = discountedPrice * (1 - 1 / (1 + findSyspar.vatrte / 100));

    } else if (govdisc == 1) {
      
      discountedPrice =
        totalPrice - (oi.disper / 100) * totalPrice;

      vatamt = discountedPrice * (1 - 1 / (1 + findSyspar.vatrte / 100));
      netvatamt = discountedPrice / (1 + findSyspar.vatrte / 100);
    }

    // vatamt = discountedPrice * (1 - 1 / (1 + findSyspar.vatrte / 100));

    return {
      vatexempt,
      discountedPrice,
      lessVat,
      discount,
      netvatamt,
      vatamt,
      govdisc,
    }
  }

  if (oi.exemptvat == "Y") {
    return exemptVAT();
  } else {
    return nonExempVAT();
  }
}

const calculateVATEXEMPT = (
  oi, vatexempt,
  findPosfile, paxCount,
  govdisc,lessVat, 
  discountedPrice, discount, 
  netvatamt, vatamt
) => {
  govdisc =
    typeof oi.govdisc !== "number" ? Number(oi.govdisc) : oi.govdisc;

  const totalPrice = findPosfile.untprc * findPosfile.itmqty;

  if (govdisc === 1) {
    vatexempt = findPosfile.extprc / paxCount;
    discountedPrice =
      totalPrice -
      (totalPrice / paxCount) *
        (oi.disper / 100);
    
  } else {
    discount =
      (totalPrice / paxCount) * (oi.disper / 100);
    discountedPrice = findPosfile.extprc - discount;
  }

  return {
    vatexempt,
    discountedPrice,
    lessVat,
    discount,
    netvatamt,
    vatamt,
    govdisc,
  }
}

const hasMEMC = (findPosfile, posfileTotal) => {
  return parseFloat(findPosfile.memc_value) > 0 &&
  findPosfile.ordertyp === "TAKEOUT" ;
  // posfileTotal.dataValues.ordertyp === "TAKEOUT" ;
}
module.exports = {addDiscounts: addDiscounts, hasMEMC};