const {Filter} = require("../model");
const {modelList} = require("../model/model");
const express = require("express");
// const {addDiscounts} = require("../model/posfile");
const router = express.Router();

const {initDatabase, getSequelize} = require("../database/index");
const sequelize = initDatabase();
const { addDiscounts, hasMEMC } = require("../model/posfile/add_discount");
const { computeTotal } = require("../model/posfile/compute_total");
const { format } = require("date-fns");

module.exports = orderItemDiscountEndpoints = () => {
  const orderitemdiscount = modelList.orderitemdiscount.instance;
  const orderitemdiscountinstance = orderitemdiscount.GetInstance();
  const posfile = modelList.posorderingfile.instance.GetInstance();
  const syspar = modelList.systemparameters.instance.GetInstance();
  const transaction = modelList.transaction.instance.GetInstance();
  const dinetype = modelList.dinetype.instance.GetInstance();

  router.get("/filter", async (req, res) => {
    const filter = new Filter(req.query);
    const result = await orderitemdiscount.ReadMany(filter.Get());

    res.status(200).json(result.rows);
  });

  router.get("/details", async (req, res) => {
    const openTran = await transaction.findOne({
      where: {status: "OPEN"},
      raw: true,
    });

    const recallTran = await transaction.findOne({where: {status: "RECALL"}});

    // const findSyspar = await syspar.findOne({});

    if (openTran) {
      const findOdDetail = await orderitemdiscountinstance.findAll({
        where: {
          ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
        },
        // { ordercde: openTran.ordercde },
      });
      return res.status(200).json(findOdDetail);
    }

    res.status(200).json([]);
  });

  router.get("/details/:ordercde", async (req, res) => {
    const {ordercde} = req.params;

    const findOdDetail = await orderitemdiscountinstance.findAll({
      where: {ordercde: ordercde},
    });

    res.status(200).json(findOdDetail);
  });

  router.delete("/deleteDetail/:recid/:filterAddOns", async (req, res) => {

    try {

      const {recid, filterAddOns} = req.params;
      const parsedArray = JSON.parse(decodeURIComponent(filterAddOns));
      // const stringRecids = parsedArray.map(String);

      const openTran = await transaction.findOne({where: {status: "OPEN"}});
      const recallTran = await transaction.findOne({where: {status: "RECALL"}});

      const findOrderDiscount = await orderitemdiscountinstance.findOne({
        where: {recid: recid},
        raw: true,
      });

      const findTotal = await posfile.findOne({
        where: {
          postrntyp: "TOTAL",
          ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
        },
      });

      const findLessVatAdj = await posfile.findOne({
        where: {
          postrntyp: "Less Vat Adj.",
          ordercde: recallTran ? recallTran.ordercde : openTran.ordercde,
        },
      });

      const findPosfile = await posfile.findOne({
        where: {orderitmid: findOrderDiscount.orderitmid, postrntyp: "ITEM"},
      });

      const lessVatAdjNumeric = parseFloat(findOrderDiscount.lessvatadj).toFixed(2);

      console.log(sequelize);
      await findLessVatAdj.update({
        extprc: await getSequelize().literal(`extprc - ${lessVatAdjNumeric}`),
      });

      await findLessVatAdj.save();

      const newvatexempt =
        parseFloat(findTotal.vatexempt) - parseFloat(findPosfile.vatexempt);

      await findPosfile.update({
        groext: findPosfile.groprc,
        groprc: findPosfile.groprc,
        grossprc: findPosfile.groprc,
        extprc: findPosfile.groprc,
        netvatamt: (findPosfile.groprc * findPosfile.itmqty) / 1.12,
        vatamt: findOrderDiscount.lessvatadj,
        lessvat: 0,
        vatexempt: newvatexempt < 0 ? "0" : newvatexempt.toFixed(2),
      });

      // await findPosfile.save();

      await findTotal.update({
        vatexempt: newvatexempt < 0 ? "0" : newvatexempt.toFixed(2),
      });

      const deleted = await orderitemdiscountinstance.destroy({
        where: {recid: recid},
      });

      if (parsedArray.length > 0) {
        const addOnsDiscounts = await orderitemdiscountinstance.findAll({
          where: {orderitmid: parsedArray},
          raw: true,
        });

        const findAddOnsPosfiles = await posfile.findAll({
          where: {orderitmid: parsedArray, postrntyp: "ITEM"},
        });

        const updateAddOns = [];

        findAddOnsPosfiles.forEach(async (addOnsPosfile, index) => {
          const lessVatAdjNumeric = parseFloat(addOnsDiscounts[index].lessvatadj);

          await findLessVatAdj.update({
            extprc: sequelize.query(`extprc - ${lessVatAdjNumeric}`),
          });

          await findLessVatAdj.save();

          const newvatexempt =
            parseFloat(findTotal.vatexempt) - parseFloat(addOnsPosfile.vatexempt);

          updateAddOns.push({
            ...addOnsPosfile,
            groext: addOnsPosfile.groprc,
            groprc: addOnsPosfile.groprc,
            grossprc: addOnsPosfile.groprc,
            extprc: addOnsPosfile.groprc,
            netvatamt: (addOnsPosfile.groprc * addOnsPosfile.itmqty) / 1.12,
            vatamt: addOnsDiscounts[index].lessvatadj,
            lessvat: 0,
            vatexempt: newvatexempt < 0 ? "0" : newvatexempt.toFixed(2),
          });

          await posfile.update(
            {
              // groext: literal("groprc"),
              // groprc: literal("groprc"),
              // grossprc: literal("groprc"),
              // extprc: literal("groprc"),
              // netvatamt: literal(
              //   `(addOnsPosfile.groprc * addOnsPosfile.itmqty) / 1.12`
              // ),
              // vatamt: literal(`addOnsDiscounts[index].lessvatadj`), // Replace with the correct calculation
              // lessvat: 0,
              // vatexempt: literal(
              //   '(newvatexempt < 0 ? "0" : newvatexempt.toFixed(2))'
              // ),
              disamt: 0,
              groext: addOnsPosfile.untprc,
              groprc: addOnsPosfile.untprc,
              grossprc: addOnsPosfile.untprc,
              extprc: addOnsPosfile.untprc,
              netvatamt: (addOnsPosfile.untprc * addOnsPosfile.itmqty) / 1.12,
              vatamt: addOnsDiscounts[index].lessvatadj,
              lessvat: 0,
              vatexempt: newvatexempt < 0 ? "0" : newvatexempt.toFixed(2),
            },
            {
              where: {
                orderitmid: parsedArray[index],
                postrntyp: "ITEM",
              },
            }
          );
          // await findAddOnsPosfiles[index].update({
          //   groext: addOnsPosfile.groprc,
          //   groprc: addOnsPosfile.groprc,
          //   grossprc: addOnsPosfile.groprc,
          //   extprc: addOnsPosfile.groprc,
          //   netvatamt: (addOnsPosfile.groprc * addOnsPosfile.itmqty) / 1.12,
          //   vatamt: addOnsDiscounts[index].lessvatadj,
          //   lessvat: 0,
          //   vatexempt: newvatexempt < 0 ? "0" : newvatexempt.toFixed(2),
          // });

          await findTotal.update({
            vatexempt: newvatexempt < 0 ? "0" : newvatexempt.toFixed(2),
          });

          await orderitemdiscountinstance.destroy({
            where: {orderitmid: parsedArray},
          });
          // return res.status(200).json([deleted, deletedAddons]);
        });

        // await findAddOnsPosfiles.update(updateAddOns);
      }

      res.status(200).json(deleted);
      
    } catch (error) {
      
      console.log(error);
      res.status(400).json(error);
    }

    
  });

  router.delete("/deleteAll/:ordercde", async (req, res) => {
    const {ordercde} = req.params;

    try {
      await orderitemdiscountinstance.destroy({
        where: {
          ordercde: ordercde,
        },
      });

      res.status(200).json({status: "success"});
    } catch (err) {
      console.error(err);
      res.status(500).json(err.message);
    }
  });

  router.post("/bulk", async (req, res) => {
    const transaction = modelList.transaction.instance.GetInstance();
    const findSyspar = await syspar.findOne({raw: true});

    const {selectedDiscount, selectedItemPosfiles, customerDetails, userDetails} = req.body;
    const { ordercde, usrcde } = userDetails;
    const paxCount = await transaction.findOne({where: {status: "OPEN"}, attributes: ["paxcount"]});

    const posfiles = await posfile.findAll({
      where: {
        ordercde: ordercde,
        trndte: format(new Date(), "yyyy-MM-dd"),
        postrntyp: "ITEM",
        batchnum: "",
        cashier: usrcde,
      },
      raw: true,
    });

    const updatedSelectedItemPosfiles = posfiles.filter((d) => selectedItemPosfiles.includes(d.recid));

    //#region Processing discount
    const discountsApplied = [];
    const discountPosfilesWithCustomerDetails = [];

    // includes the add ons items. para masama sa calculations;
    const addons = posfiles.filter((d) => d.isaddon);
    const selectedItemPosfilesWithAddon = [
      ...updatedSelectedItemPosfiles,
      ...addons,
    ];

    selectedItemPosfilesWithAddon.forEach((itemPosfile) => {
      // let discount;

      // // calculate discount based on its govdisc field
      // if (selectedDiscount.govdisc == 1) {
      //   discount =
      //     Math.round(
      //       (((itemPosfile.netvatamt) * selectedDiscount.disper) /
      //         100) *
      //         100
      //     ) / 100;
      // } else {
      //   discount =
      //     itemPosfile.untprc *
      //     itemPosfile.itmqty *
      //     (selectedDiscount.disper / 100);
      // }

      const discountTemplate = {
        itmcde: itemPosfile.itmcde,
        amtdis: itemPosfile.disamt,
        salwoutvat: itemPosfile.netvatamt,
        orderitmid: itemPosfile.orderitmid,
        discde: selectedDiscount.discde,
        distyp: selectedDiscount.distyp,
        disamt: selectedDiscount.disamt,
        disper: selectedDiscount.disper,
        ordercde: ordercde,
        lessvatadj:
          ((itemPosfile.untprc || 0) *
          (itemPosfile.itmqty || 0) *
          (1 - 1 / 1.12)).toFixed(2),
        exemptvat: selectedDiscount.exemptvat,
        disid: selectedDiscount.recid,
        govdisc: selectedDiscount.govdisc,
        scharge: selectedDiscount.scharge,
        nolessvat: selectedDiscount.nolessvat,
        vatexempt: itemPosfile.vatexempt
      };

      const content = {...itemPosfile, ...customerDetails};

      content["recid"] = undefined;
      content["postrntyp"] = "DISCOUNT";
      content["govdisc"] = selectedDiscount.govdisc;
      content["itmcde"] = selectedDiscount.discde;
      content["itmdsc"] = "";
      content["itmqty"] = 0;
      content["vatrte"] = 0;
      content["vatamt"] = 0;
      content["grossprc"] = 0;
      content["disamt"] = 0;
      content["taxcde"] = "";
      content["discde"] = selectedDiscount?.discde;
      content["distyp"] = itemPosfile.distyp;
      content["disper"] = itemPosfile.disper;
      // content["amtdis"] = discount;
      // content["extprc"] = discount;
      // content["groext"] = discount;
      // content["groprc"] = discount;
      // content["netvatamt"] = discount;
      // content["lessvat"] = discountTemplate.lessvatadj;

      discountPosfilesWithCustomerDetails.push(content);
      discountsApplied.push(discountTemplate);
    });

    const updatedPosfileTOTAL = await posfile.findOne({
      where: {
        postrntyp: "TOTAL",
        batchnum: "",
        ordercde: ordercde,
      },
    });
    delete updatedPosfileTOTAL.extprc;
    delete updatedPosfileTOTAL.disamt;
    // delete updatedPosfile.netvatamt;

    discountsApplied.forEach((item, index) => {
      if (item.exemptvat === "Y" && updatedPosfileTOTAL) {
        const vatExempt =
          updatedPosfileTOTAL.vatexempt === null
            ? 0 + parseFloat(item.salwoutvat)
            : parseFloat(updatedPosfileTOTAL.vatexempt) +
              parseFloat(item.salwoutvat);

        const netvatamt =
          parseFloat(updatedPosfileTOTAL.netvatamt) > 0
            ? parseFloat(updatedPosfileTOTAL.netvatamt) -
              parseFloat(item?.salwoutvat)
            : 0;

        const vatAmt =
          parseFloat(updatedPosfileTOTAL.vatamt) > 0
            ? parseFloat(updatedPosfileTOTAL.vatamt) -
              parseFloat(selectedItemPosfilesWithAddon[index].vatamt)
            : 0;
 
        updatedPosfileTOTAL.vatexempt = vatExempt.toFixed(2);
        updatedPosfileTOTAL.netvatamt =
          netvatamt < 1 ? "0" : (netvatamt.toFixed(2));
        updatedPosfileTOTAL.vatamt = vatAmt < 1 ? "0" : (vatAmt.toFixed(2));
      } else if (item.nolessvat == 1) {
        const netvatamt = parseFloat(updatedPosfileTOTAL?.groext) / 1.12;
        const vatAmt = parseFloat(updatedPosfileTOTAL?.groext) - netvatamt;
        updatedPosfileTOTAL.netvatamt = netvatamt.toFixed(2);
        updatedPosfileTOTAL.vatamt = vatAmt.toFixed(2);
      }
    });

    //#region Add service charge discount
    let hasSchargeDisc = false;
    let scharge_disc = 0;
    const updatedPosfiles = discountsApplied.map((d) => {
      const foundPosfileItem = {
        ...posfiles.find((a) => a.orderitmid === d.orderitmid),
      };

      const isMemc = hasMEMC(foundPosfileItem)
      const sCharge = foundPosfileItem.ordertyp=="DINEIN"?findSyspar.dinein_scharge:findSyspar.takeout_scharge;


      if (d.scharge.toString() === "0") return foundPosfileItem;
      hasSchargeDisc = true;


      if (d.distyp === "Percent" && foundPosfileItem) {

        if(isMemc)
          scharge_disc = (foundPosfileItem.memc_value /paxCount.paxcount || 0) / 1.12 * (sCharge / 100) * (d.disper / 100);
        else{
          scharge_disc = (foundPosfileItem.scharge / paxCount.paxcount || 0) * (d.disper / 100);
        }
        
        foundPosfileItem.scharge_disc = parseFloat(foundPosfileItem.scharge_disc) + scharge_disc;
      }

      return foundPosfileItem;
    });

    console.log("UPDATED DAW", updatedPosfiles);

    if (hasSchargeDisc) {
      // update service charge discount of posfile item
      let hasError = false;
      for (const data of updatedPosfiles) {
        const result = await posfile.update(data, {where: {recid: data.recid}});

        if (!result) {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        return res.status(500).json({success: false});
      }
    }
    //#endregion    
    //#endregion

    //#region Adding discounts
    const discountsNum = await addDiscounts(discountsApplied);

    const discountsObj = discountsApplied.map((d) => {

      const foundItem = discountsNum.find((e) => e.orderitmid === d.orderitmid);

      return {
        ...d,
        lessvatadj: foundItem ? foundItem.lessvat.toFixed(2) : 0,
        amtdis: foundItem ? foundItem.discount : 0,
      };
    });

    await orderitemdiscountinstance.bulkCreate(discountsObj);
    //#endregion

    //#region Adding discounts to posfile table
    const discountList = await Promise.all(
      discountPosfilesWithCustomerDetails.map(async (dsc) => {

        const foundItem = discountsNum.find((e) => e.orderitmid === dsc.orderitmid);
        const findUpdatedItem = updatedPosfiles.find(d=> d.orderitmid == dsc.orderitmid);

        if (dsc.discde === "MOV" || dsc.discde === "Athlete") {
          // const newdsc = {
          //   ...dsc, 
          //   netvatamt: 0, 
          //   lessvat: foundItem.lessvat, 
          //   amtdis: foundItem.discount,
          // };

          const newdsc = {
            ...dsc,
            lessvat: foundItem.lessvat,
            amtdis: foundItem.discount,
            untprc: foundItem.discount,
            extprc: foundItem.discount,
            groext: foundItem.discount,
            groprc: foundItem.discount,
            netvatamt: foundItem.discount,
            netvatprc: foundItem.discount,
          }

          const create = await modelList.posorderingfile.instance.CreateOrUpdate(
            {recid: newdsc.recid},
            newdsc
          );
          return create;
        } else {
          const newdsc = {
            ...dsc,
            lessvat: foundItem.lessvat,
            amtdis: foundItem.discount,
            untprc: foundItem.discount,
            extprc: foundItem.discount,
            groext: foundItem.discount,
            groprc: foundItem.discount,
            netvatamt: foundItem.discount,
            netvatprc: foundItem.discount,
            scharge_disc: findUpdatedItem.scharge_disc,
            vatexempt: foundItem.vatexempt,
            ordocnum: foundItem.ordocnum
          };

          const create = await modelList.posorderingfile.instance.CreateOrUpdate({recid: dsc.recid}, newdsc);
          return create;
        }
      })
    );

    await modelList.posorderingfile.instance.CreateOrUpdate(
      {recid: updatedPosfileTOTAL.recid},
      updatedPosfileTOTAL
    );

    await computeTotal(posfile, {
      postrntyp: "ITEM",
      ordercde: updatedPosfileTOTAL.ordercde,
      // itmcomtyp: null,
    });

    const updateTotal = await posfile.findOne({
      where: {
        postrntyp: "TOTAL",
        ordercde: updatedPosfileTOTAL.ordercde,
      },
    });

    res.status(200).json({discountList, posfile: updateTotal});
    //#endregion
  });

  return router;
};
