// const posfile = require("./modelschema/posfile");
// const {initDatabase} = require("../database/index");

// const {modelList} = require("../model/model");
// const sequelize = initDatabase();

// const computeTotal = async (model, filter) => {
//   const posfile = modelList.posfile.instance.GetInstance();
//   const transaction = modelList.transaction.instance.GetInstance();

//   const openTran = await transaction.findOne({where: {status: "OPEN"}});

//   const recallTran = await transaction.findOne({where: {status: "RECALL"}});

//   const findTotal = await posfile.findOne({
//     where: {
//       postrntyp: "TOTAL",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });
//   const findVatExempt = await posfile.findOne({
//     where: {
//       postrntyp: "VATEXEMPT",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });
//   const findLessVat = await posfile.findOne({
//     where: {
//       postrntyp: "Less Vat Adj.",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });
//   const findDiscountable = await posfile.findOne({
//     where: {
//       postrntyp: "DISCOUNTABLE",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });
//   const findServiceCharge = await posfile.findOne({
//     where: {
//       postrntyp: "SERVICE CHARGE",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });

//   console.log("recall to pre", recallTran);
//   console.log("open to pre,", openTran);
//   console.log("total to eh", findTotal);

//   const totalAmount = await posfile.findAll({
//     attributes: [
//       [sequelize.fn("SUM", sequelize.col("groext")), "totalAmount"],
//       [sequelize.fn("SUM", sequelize.col("vatamt")), "totalVat"],
//       [sequelize.fn("SUM", sequelize.col("netvatamt")), "totalNetVat"],
//       [sequelize.fn("SUM", sequelize.col("disamt")), "totalDiscount"],
//       [sequelize.fn("SUM", sequelize.col("vatexempt")), "vatExemptTotal"],
//       [sequelize.fn("SUM", sequelize.col("lessvat")), "lessVatTotal"],
//       [sequelize.fn("SUM", sequelize.col("extprc")), "totalNet"],
//       [sequelize.fn("SUM", sequelize.col("scharge")), "totalServiceCharge"],
//     ],
//     where: filter,
//     raw: true,
//   });

//   const amountTotal = totalAmount[0].totalAmount;
//   const vatTotal = totalAmount[0].totalVat;
//   const vatNetTotal = totalAmount[0].totalNetVat;
//   const discount = totalAmount[0].totalDiscount;
//   const vatExemptTotal = totalAmount[0].vatExemptTotal;
//   const lessVatTotal = totalAmount[0].lessVatTotal;
//   const netTotal = totalAmount[0].totalNet;
//   const serviceChargeTotal = totalAmount[0].totalServiceCharge;

//   console.log("putek", vatNetTotal);

//   if (recallTran) {
//   }

//   await findTotal.update({
//     groext: amountTotal,
//     extprc: netTotal,
//     untprc: 0,
//     groprc: 0,
//     grossprc: 0,
//     netvatamt: vatNetTotal,
//     vatamt: vatTotal,
//     disamt: discount,
//   });

//   await findVatExempt.update({
//     extprc: vatExemptTotal,
//   });

//   await findLessVat.update({
//     extprc: lessVatTotal,
//   });

//   await findDiscountable.update({
//     extprc: vatExemptTotal,
//   });

//   await findServiceCharge.update({
//     extprc: serviceChargeTotal,
//   });
// };

// const freeAllItem = async (freereason) => {
//   const posfile = modelList.posfile.instance.GetInstance();
//   const syspar = modelList.systemparameters.instance.GetInstance();
//   const transaction = modelList.transaction.instance.GetInstance();

//   const openTran = await transaction.findOne({where: {status: "OPEN"}});

//   // const findAllItem = await posfile.findAll({ where: { postrntyp: "ITEM", ordercde : findSyspar.ordercde}});

//   const updateAllItem = await posfile.update(
//     {
//       groext: 0,
//       extprc: 0,
//       untprc: 0,
//       groprc: 0,
//       netvatamt: 0,
//       vatamt: 0,
//       disamt: 0,
//       freereason: freereason,
//     },
//     {
//       where: {
//         postrntyp: "ITEM",
//         ordercde: openTran.ordercde,
//       },
//     }
//   );

//   computeTotal(null, {postrntyp: "ITEM", ordercde: openTran.ordercde});

//   const findTransaction = await transaction.findOne({
//     where: {ordercde: openTran.ordercde},
//   });
//   findTransaction.update({status: "CLOSED", closetime: new Date()});

//   return updateAllItem;
// };

// const addDiscounts = async (bulkOrderItem) => {
//   const posfile = modelList.posfile.instance.GetInstance();
//   const syspar = modelList.systemparameters.instance.GetInstance();
//   const transaction = modelList.transaction.instance.GetInstance();
//   const discountSearch = modelList.discount.instance;

//   const findSyspar = await syspar.findOne({});
//   const openTran = await transaction.findOne({where: {status: "OPEN"}});
//   const recallTran = await transaction.findOne({where: {status: "RECALL"}});

//   const findLessVatAdj = await posfile.findOne({
//     where: {
//       postrntyp: "Less Vat Adj.",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });
//   const posfileTotal = await posfile.findOne({
//     where: {
//       postrntyp: "TOTAL",
//       ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     },
//   });

//   const mappedBulkOrderItem = await Promise.all(
//     bulkOrderItem.map(async (oi) => {
//       const findPosfile = await posfile.findOne({
//         where: {orderitmid: oi.orderitmid},
//         raw: true,
//       });

//       console.log("nakita ko", findPosfile);

//       let discountedPrice = 0;
//       let lessVat = 0;
//       let vatexempt = 0;
//       let vatamt = 0;
//       let netvatamt = 0;
//       let discount = 0;
//       let govdisc = 0;
//       const findDiscount = await discountSearch.GetInstance().findOne({
//         where: {
//           discde: oi.discde,
//         },
//       });
//       const paxCount = openTran.paxcount;

//       if (findPosfile.taxcde == "VATABLE") {
//         console.log("dito kaya 7");

//         if (oi.exemptvat == "Y") {
//           vatexempt =
//             findPosfile.extprc / paxCount / (1 + findSyspar.vatrte / 100);

//           const nolessvat =
//             typeof oi.nolessvat !== "number"
//               ? Number(oi.nolessvat)
//               : oi.nolessvat;
//           govdisc =
//             typeof oi.govdisc !== "number" ? Number(oi.govdisc) : oi.govdisc;

//           if (nolessvat === 0) {
//             if (govdisc === 1) {
//               lessVat =
//                 (findPosfile.extprc / paxCount) *
//                 (1 - 1 / (1 + findSyspar.vatrte / 100));

//               discountedPrice = findPosfile.extprc - lessVat;

//               console.log(discountedPrice);
//               console.log("dito kaya 3", oi.disper, vatexempt, lessVat);
//             } else {
//               discount =
//                 findPosfile.extprc * findPosfile.itmqty * (oi.disper / 100);

//               discountedPrice =
//                 findPosfile.extprc * findPosfile.itmqty - discount;
//               discountedPrice -= lessVat;
//             }
//             console.log("dito kaya 4", discountedPrice);
//           } else if (oi.discde === "Diplomat") {
//             lessVat =
//               (findPosfile.extprc / paxCount) *
//               (1 - 1 / (1 + findSyspar.vatrte / 100));

//             discountedPrice = findPosfile.extprc - lessVat;
//             // discountedPrice =
//             //   findPosfile.extprc / (1 + findSyspar.vatrte / 100);
//             console.log("dito kaya 5");
//           } else {
//             // if (govdisc === 1) {
//             //   discountedPrice =
//             //     findPosfile.extprc * findPosfile.itmqty -
//             //     (oi.disper / 100) * vatexempt;
//             // } else {

//             // government to

//             switch (findDiscount.dataValues.distyp) {
//               case "Amount":
//                 discount = oi.disamt;
//                 break;
//               case "Percent":
//                 console.log("xxx", discountedPrice);
//                 discount = (findPosfile.extprc / 1.12) * (oi.disper / 100);
//                 break;
//               default:
//                 break;
//             }
//             if (
//               findPosfile.memc > 0 &&
//               posfileTotal.dataValues.ordertyp === "TAKEOUT"
//             ) {
//               console.log("in here");
//               lessVat = findPosfile.memc - findPosfile.memc / 1.12;
//             } else {
//               lessVat = findPosfile.extprc - findPosfile.extprc / 1.12;
//             }

//             discountedPrice = findPosfile.extprc - discount - lessVat;
//             netvatamt = findPosfile.extprc / 1.12;

//             console.log("oi to", oi);
//             console.log("dito kaya 6");
//             console.log(discountedPrice);
//             console.log("konting vat", lessVat);
//           }
//         } else {
//           // exempvat === N
//           vatamt =
//             ((findPosfile.extprc * findPosfile.itmqty) / paxCount) *
//             (1 - 1 / (1 + findSyspar.vatrte / 100));
//           netvatamt =
//             (findPosfile.extprc * findPosfile.itmqty) /
//             paxCount /
//             (1 + findSyspar.vatrte / 100);

//           const nolessvat =
//             typeof oi.nolessvat !== "number"
//               ? Number(oi.nolessvat)
//               : oi.nolessvat;
//           govdisc =
//             typeof oi.govdisc !== "number" ? Number(oi.govdisc) : oi.govdisc;

//           if (nolessvat == 0) {
//             console.log("dito kaya 0");

//             switch (findDiscount.dataValues.distyp) {
//               case "Amount":
//                 discount = oi.disamt;
//                 discountedPrice = findPosfile.extprc - discount;
//                 break;
//               case "Percent":
//                 // discount =
//                 //   (oi.disper / 100) *
//                 //   ((findPosfile.extprc * findPosfile.itmqty) /
//                 //     paxCount /
//                 //     (1 + findSyspar.vatrte / 100));

//                 // discountedPrice =
//                 // findPosfile.extprc - (oi.disper / 100) * netvatamt;

//                 discount = (oi.disper / 100) * findPosfile.extprc;
//                 discountedPrice = findPosfile.extprc - discount;

//                 break;
//               default:
//                 break;
//             }

//             // discount =
//             //   (oi.disper / 100) *
//             //   ((findPosfile.extprc * findPosfile.itmqty) /
//             //     paxCount /
//             //     (1 + findSyspar.vatrte / 100));

//             if (oi.discde === "MOV") {
//               netvatamt = 0;
//             }
//             console.log(netvatamt);
//             console.log("regular", discountedPrice, "vs", discount);
//           } else if (nolessvat == 1) {
//             // discountedPrice = (findPosfile.untprc * findPosfile.itmqty) - ((oi.disper/100) * netvatamt);

//             // non government

//             switch (findDiscount.dataValues.distyp) {
//               case "Amount":
//                 discount = oi.disamt;
//                 break;
//               case "Percent":
//                 discount = (findPosfile.extprc * oi.disper) / 100;
//                 break;
//               default:
//                 break;
//             }

//             if (oi.discde === "Athlete") {
//               discount = ((findPosfile.extprc / 1.12) * oi.disper) / 100;
//               netvatamt = 0;
//             }
//             discountedPrice = findPosfile.extprc - discount;

//             console.log(
//               "anyare 4",
//               discountedPrice,
//               "per item",
//               findPosfile.extprc,
//               "vs",
//               discount,
//               "percent",
//               oi.disper
//             );
//           } else if (govdisc == 1) {
//             console.log("ayo dumaan?");
//             discountedPrice =
//               findPosfile.extprc - (oi.disper / 100) * findPosfile.extprc;

//             vatamt = discountedPrice * (1 - 1 / (1 + findSyspar.vatrte / 100));
//             netvatamt = discountedPrice / (1 + findSyspar.vatrte / 100);
//             console.log("anyare 5", discountedPrice, "vs", discount);
//           }
//         }
//       } else if (findPosfile.taxcde == "VAT EXEMPT") {
//         console.log("dito kaya 2");

//         if (govdisc === 1) {
//           vatexempt = (findPosfile.extprc * findPosfile.itmqty) / paxCount;
//           discountedPrice =
//             findPosfile.extprc * findPosfile.itmqty -
//             ((findPosfile.extprc * findPosfile.itmqty) / paxCount) *
//               (oi.disper / 100);
//           console.log("anyare 6", discountedPrice, "vs", discount);
//         } else {
//           discount =
//             findPosfile.extprc * findPosfile.itmqty * (oi.disper / 100);
//           discountedPrice = findPosfile.extprc * findPosfile.itmqty - discount;
//           console.log("anyare 7", discountedPrice, "vs", discount);
//         }
//       }

//       let withoutMemc = 0;
//       let withMemc = 0;
//       let origPrice = 0;

//       switch (findDiscount.dataValues.distyp) {
//         case "Percent":
//           console.log("pasa", discount);
//           withoutMemc = discount;
//           withMemc =
//             govdisc === 1
//               ? (oi.disper / 100) *
//                 (findPosfile.memc / paxCount / (1 + findSyspar.vatrte / 100))
//               : discount;

//           // withoutMemc = discount;
//           // withoutMemc =
//           //   govdisc === 1
//           //     ? (oi.disper / 100) *
//           //       ((findPosfile.extprc * findPosfile.itmqty) /
//           //         paxCount /
//           //         (1 + findSyspar.vatrte / 100))
//           //     : discount;
//           // console.log(discount);
//           // console.log("withoutMemc 2", withoutMemc);

//           break;
//         case "Amount":
//           console.log("update shet", discount);
//           withoutMemc = discount;
//           withMemc =
//             govdisc === 1
//               ? (oi.disamt / 100) *
//                 (findPosfile.memc / paxCount / (1 + findSyspar.vatrte / 100))
//               : discount;

//           // withMemc = discount;
//           // withoutMemc =
//           //   govdisc === 1
//           //     ? (oi.disamt / 100) *
//           //       ((findPosfile.extprc * findPosfile.itmqty) /
//           //         paxCount /
//           //         (1 + findSyspar.vatrte / 100))
//           //     : discount;

//           break;
//         default:
//           break;
//       }

//       console.log("ito luma", withoutMemc);
//       console.log("ito bago", withMemc);

//       if (
//         findPosfile.memc > 0 &&
//         posfileTotal.dataValues.ordertyp === "TAKEOUT"
//       ) {
//         console.log("dito ba?");
//         origPrice += findPosfile.extprc - withMemc - lessVat;
//       }

//       console.log(origPrice);
//       console.log(discountedPrice, "vs", discount);

//       console.log("less vats", lessVat);
//       console.log("sales without", netvatamt);

//       return {
//         ...findPosfile,
//         extprc: origPrice > 0 ? origPrice : discountedPrice,
//         // extprc: discountedPrice,
//         // disamt:
//         // govdisc === 1
//         // ? (oi.disper / 100) *
//         // ((findPosfile.extprc * findPosfile.itmqty) /
//         // paxCount /
//         // (1 + findSyspar.vatrte / 100))
//         // : discount,
//         disamt:
//           findPosfile.memc > 0 && posfileTotal.dataValues.ordertyp === "TAKEOUT"
//             ? withMemc
//             : withoutMemc,
//         lessvat: lessVat,
//         vatexempt: vatexempt,
//         vatamt: vatamt,
//         netvatamt: netvatamt,
//       };
//     })
//   );

//   await posfile.bulkCreate(mappedBulkOrderItem, {
//     updateOnDuplicate: [
//       "groext",
//       "untprc",
//       "disamt",
//       "grossprc",
//       "groprc",
//       "extprc",
//       "lessvat",
//       "vatexempt",
//       "vatamt",
//       "netvatamt",
//     ],
//   });
//   await computeTotal(posfile, {
//     postrntyp: "ITEM",
//     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     itmcomtyp: null,
//   });

//   await computeTotal(posfile, {
//     postrntyp: "ITEM",
//     ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
//     // itmcomtyp: null,
//   });

//   return mappedBulkOrderItem.map((d) => {
//     return {
//       itmcde: d.itmcde,
//       discount: d.disamt,
//     };
//   });
// };

// module.exports = function AddData() {};

// module.exports = {
//   computeTotal: computeTotal,
//   addDiscounts: addDiscounts,
//   freeAllItem: freeAllItem,
// };
// // module.exports =
