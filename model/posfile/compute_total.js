const { fn, col } = require("sequelize");
const { modelList } = require("../model");
const { Op } = require("sequelize");

const computeTotal = async (model, filter) => {
  // const posfile = modelList.posfile.instance.GetInstance();
  const transaction = modelList.transaction.instance.GetInstance();

  const openTran = await transaction.findOne({ where: { status: "OPEN" } });
  const recallTran = await transaction.findOne({ where: { status: "RECALL" } });

  const posfileOrdering = modelList.posorderingfile.instance.GetInstance();
  await _compute(
    posfileOrdering,
    recallTran ? recallTran.ordercde : openTran.ordercde,
    filter
  );

  //#region COMMENTED
  // const findTotal = await posfile.findOne({
  //   where: {
  //     postrntyp: "TOTAL",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  // });
  // const findVatExempt = await posfile.findOne({
  //   where: {
  //     postrntyp: "VATEXEMPT",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  // });
  // const findLessVat = await posfile.findOne({
  //   where: {
  //     postrntyp: "Less Vat Adj.",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  // });
  // const findDiscountable = await posfile.findOne({
  //   where: {
  //     postrntyp: "DISCOUNTABLE",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  // });
  // const findServiceCharge = await posfile.findOne({
  //   where: {
  //     postrntyp: "SERVICE CHARGE",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  // });
  // const findDiscounts = await posfile.findAll({
  //   where: {
  //     postrntyp: "DISCOUNT",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  // });
  // const findItem = await posfile.findAll({
  //   where: {
  //     postrntyp: "ITEM",
  //     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
  //   },
  //   raw: true,
  // });

  // const totalAmount = await posfile.findAll({
  //   attributes: [
  //     [fn("SUM", col("groext")), "totalAmount"],
  //     [fn("SUM", col("vatamt")), "totalVat"],
  //     [fn("SUM", col("netvatamt")), "totalNetVat"],
  //     [fn("SUM", col("disamt")), "totalDiscount"],
  //     [fn("SUM", col("vatexempt")), "vatExemptTotal"],
  //     [fn("SUM", col("lessvat")), "lessVatTotal"],
  //     [fn("SUM", col("extprc")), "totalNet"],
  //     [fn("SUM", col("scharge")), "totalServiceCharge"],
  //     [fn("SUM", col("scharge_disc")), "totalServiceChargePerItem"],
  //   ],
  //   where: filter,
  //   raw: true,
  // });

  // const scharge_discount_peritem = findItem.reduce((acc, curr) =>{
  //   return acc + parseFloat(curr.scharge_disc);
  // }, 0)

  // const scharge_discounts = findDiscounts.reduce((acc, curr) => {
  //   return acc + parseFloat(curr.scharge_disc);
  // }, 0);

  // const amountTotal = totalAmount[0].totalAmount;
  // const vatTotal = totalAmount[0].totalVat;
  // const vatNetTotal = totalAmount[0].totalNetVat;
  // const discount = totalAmount[0].totalDiscount;
  // const vatExemptTotal = totalAmount[0].vatExemptTotal;
  // const lessVatTotal = totalAmount[0].lessVatTotal;
  // const serviceChargeTotal = totalAmount[0].totalServiceCharge;
  // const serviceChargeDiscTotal = totalAmount[0].totalServiceChargePerItem;
  // const netTotal = (totalAmount[0].totalNet*1) + (serviceChargeTotal*1) - (serviceChargeDiscTotal*1);

  // // console.log("compute mo to",netTotal);

  // if (recallTran) {
  // }

  // // console.log("findItem", scharge_discount_peritem);

  // await findTotal.update({
  //   groext: amountTotal,
  //   extprc: netTotal,
  //   untprc: 0,
  //   groprc: 0,
  //   grossprc: 0,
  //   netvatamt: vatNetTotal,
  //   vatexempt: vatExemptTotal,
  //   vatamt: vatTotal,
  //   disamt: discount,
  //   scharge_disc: serviceChargeDiscTotal,
  //   scharge: serviceChargeTotal
  // });

  // await findVatExempt.update({
  //   extprc: vatExemptTotal,
  // });

  // await findLessVat.update({
  //   extprc: lessVatTotal,
  // });

  // await findDiscountable.update({
  //   extprc: vatExemptTotal,
  // });

  // await findServiceCharge.update({
  //   extprc: serviceChargeTotal,
  //   amtdis: serviceChargeDiscTotal,
  // });
  //#endregion
};

const recomputeTotalByOrdercde = async (filter) => {
  const posfile = modelList.posfile.instance.GetInstance();
  await _compute(posfile, filter.ordercde, filter);
};

const _compute = async (posfile, ordercde, filter) => {
  const findTotal = await posfile.findOne({
    where: {
      [Op.or]: [{ postrntyp: "TOTAL" }, { itmcde: "TOTAL" }],
      ordercde: ordercde,
    },
  });

  const findVatExempt = await posfile.findOne({
    where: {
      postrntyp: "VATEXEMPT",
      ordercde: ordercde,
    },
  });
  const findLessVat = await posfile.findOne({
    where: {
      postrntyp: "Less Vat Adj.",
      ordercde: ordercde,
    },
  });
  const findDiscountable = await posfile.findOne({
    where: {
      postrntyp: "DISCOUNTABLE",
      ordercde: ordercde,
    },
  });
  const findServiceCharge = await posfile.findOne({
    where: {
      postrntyp: "SERVICE CHARGE",
      ordercde: ordercde,
    },
  });
  // const findDiscounts = await posfile.findAll({
  //   where: {
  //     postrntyp: "DISCOUNT",
  //     ordercde: ordercde,
  //   },
  // });
  // const findItem = await posfile.findAll({
  //   where: {
  //     postrntyp: "ITEM",
  //     ordercde: ordercde,
  //   },
  //   raw: true,
  // });

  const totalAmount = await posfile.findAll({
    attributes: [
      [fn("SUM", col("groext")), "totalAmount"],
      [fn("SUM", col("vatamt")), "totalVat"],
      [fn("SUM", col("netvatamt")), "totalNetVat"],
      [fn("SUM", col("disamt")), "totalDiscount"],
      [fn("SUM", col("vatexempt")), "vatExemptTotal"],
      [fn("SUM", col("lessvat")), "lessVatTotal"],
      [fn("SUM", col("extprc")), "totalNet"],
      [fn("SUM", col("scharge")), "totalServiceCharge"],
      [fn("SUM", col("scharge_disc")), "totalServiceChargePerItem"],
    ],
    where: filter,
    raw: true,
  });

  // COMMENTED NOT USED
  // const scharge_discount_peritem = findItem.reduce((acc, curr) =>{
  //   return acc + parseFloat(curr.scharge_disc);
  // }, 0)

  // const scharge_discounts = findDiscounts.reduce((acc, curr) => {
  //   return acc + parseFloat(curr.scharge_disc);
  // }, 0);

  const amountTotal = totalAmount[0].totalAmount ?? 0;
  const vatTotal = totalAmount[0].totalVat ?? 0;
  const vatNetTotal = totalAmount[0].totalNetVat ?? 0;
  const discount = totalAmount[0].totalDiscount ?? 0;
  const vatExemptTotal = totalAmount[0].vatExemptTotal ?? 0;
  const lessVatTotal = totalAmount[0].lessVatTotal ?? 0;
  const serviceChargeTotal = totalAmount[0].totalServiceCharge ?? 0;
  const serviceChargeDiscTotal = totalAmount[0].totalServiceChargePerItem ?? 0;
  const netTotal =
    totalAmount[0].totalNet * 1 +
      serviceChargeTotal * 1 -
      serviceChargeDiscTotal * 1 ?? 0;

  if (findTotal) {
    await findTotal.update({
      groext: amountTotal ?? 0,
      extprc: netTotal ?? 0,
      untprc: 0,
      groprc: 0,
      grossprc: 0,
      netvatamt: vatNetTotal ?? 0,
      vatexempt: vatExemptTotal ?? 0,
      vatamt: vatTotal ?? 0,
      disamt: discount ?? 0,
      scharge_disc: serviceChargeDiscTotal ?? 0,
      scharge: serviceChargeTotal ?? 0,
    });
  } else {
    console.log("No total?");
  }

  await findVatExempt.update({
    extprc: vatExemptTotal ?? 0,
  });

  await findLessVat.update({
    extprc: lessVatTotal ?? 0,
  });

  await findDiscountable.update({
    extprc: vatExemptTotal ?? 0,
  });

  await findServiceCharge.update({
    extprc: serviceChargeTotal ?? 0,
    amtdis: serviceChargeDiscTotal ?? 0,
  });
};

module.exports = {
  computeTotal: computeTotal,
  recomputeTotalByOrdercde: recomputeTotalByOrdercde,
};
