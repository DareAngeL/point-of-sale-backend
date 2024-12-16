const { Op, fn, col, literal, where } = require("sequelize");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();
const { Filter } = require("../model");
const { v4: uuidv4 } = require("uuid");
const { format } = require("date-fns");
const {
  dateTodayFormatter,
  dateTimeTodayFormatter,
  timeTodayFormatter,
  dateFormatter,
  _log,
} = require("../helper");
const item = require("../model/modelschema/item");
const e = require("express");
const { id } = require("date-fns/locale");
const { paginate } = require("../helper/paginate/pagination");
const {
  computeTotal,
  recomputeTotalByOrdercde,
} = require("../model/posfile/compute_total");
const { freeAllItem } = require("../model/posfile/freeallitems");
const { getAllPrevious } = require("../services/posfile");
// const { round2decimal } = require("../helper/decimal");
const { convertToMinutes } = require("../helper/date-helper");
const {
  processQueue,
  enqueue,
  isProcessing,
} = require("../services/posfileQueue");
const { round2decimal } = require("../helper/decimal");
const { fs } = require("file-system");
const { fixNoOrdocnum } = require("../services/posorderingfile");

module.exports = posfileEndpoints = () => {
  const posfileordering = modelList.posorderingfile.instance;
  const posfile = modelList.posfile.instance;
  const pos = posfile.GetInstance();
  const posDaily = posfileordering.GetInstance();
  const models = posfile.GetModelListInstance();
  const syspar = models.systemparameters.instance.GetInstance();
  const transaction = models.transaction.instance.GetInstance();
  const header = models.headerfile.instance.GetInstance();
  const timelogfile = models.timelogfile.instance.GetInstance();

  router.get("/", async (req, res) => {
    const find = await posfile.Read();
    res.status(200).json(find);
  });

  router.get("/getLastCashfund", async (req, res) => {
    const pos = posfile.GetInstance();

    const findCashFund = await pos.findOne({
      where: {
        postrntyp: "CASHFUND",
        trndte: dateTodayFormatter(),
      },
      order: [["logtim", "DESC"]],
    });

    res.status(200).json(findCashFund);
  });

  router.get("/hasTransactions", async (req, res) => {
    const find = await posfile.Read();
    if (find.length > 0) return res.status(200).json({ status: true });

    res.status(200).json({ status: false });
  });

  router.post("/priceoverride", async (req, res) => {
    const request = req.body;
    const findSyspar = await syspar.findOne({});

    let netvatamt = 0;
    let vatamt = 0;
    let vatexempt = 0;

    if (request.taxcde == "VATABLE") {
      netvatamt = request.groext / (1 + findSyspar.vatrte / 100);
      // vatamt = (request.untprc * request.itmqty) * (1 - 1 /(1+findSyspar[0].vatrte/100))
      vatamt = request.groext - netvatamt;
    } else if (request.taxcde == "VAT EXEMPT") {
      vatexempt = request.groext;
    }

    let serviceCharge = 0;

    if (request.ordertyp == "DINEIN") {
      serviceCharge =
        (vatexempt != 0 ? vatexempt : netvatamt) *
        (findSyspar.dinein_scharge / 100);
    } else {
      serviceCharge =
        (vatexempt != 0 ? vatexempt : netvatamt) *
        (findSyspar.takeout_scharge / 100);
    }

    const overridePrice = { ...req.body, scharge: serviceCharge };

    const create = await posfileordering.CreateOrUpdate(
      { recid: req.body.recid },
      overridePrice
    );
    const openTran = await transaction.findOne({
      where: {
        status: {
          [Op.or]: ["RECALL", "OPEN"],
        },
      },
      order: [["status", "DESC"]],
    });

    await computeTotal(posfileordering, {
      postrntyp: "ITEM",
      ordercde: openTran.ordercde,
      // itmcomtyp: null,
    });
    res.status(200).json(create);
  });

  router.post("/", async (req, res) => {
    const bulkCreate = await posfileordering.BulkCreate(req.body);
    const openTran = await transaction.findOne({
      where: {
        status: {
          [Op.or]: ["RECALL", "OPEN"],
        },
      },
      order: [["status", "DESC"]],
    });

    await computeTotal(posfileordering, {
      postrntyp: "ITEM",
      ordercde: openTran.ordercde,
      // itmcomtyp: null,
    });
    res.status(200).json(bulkCreate);
  });

  router.put("/discountdetails", async (req, res) => {
    const create = await posfile.CreateOrUpdate(
      { recid: req.body.recid },
      req.body
    );
    res.status(200).json(create);
  });

  router.post("/discountdetails", async (req, res) => {
    const { discounts, updatedPosfile } = req.body;

    const discountList = await Promise.all(
      discounts.map(async (dsc) => {
        if (dsc.discde === "MOV" || dsc.discde === "Athlete") {
          const newdsc = { ...dsc, netvatamt: 0 };
          const create = await posfile.CreateOrUpdate(
            { recid: newdsc.recid },
            newdsc
          );
          return create;
        } else {
          const create = await posfile.CreateOrUpdate(
            { recid: dsc.recid },
            dsc
          );
          return create;
        }
      })
    );

    console.log("xxx", updatedPosfile);

    await posfile.CreateOrUpdate(
      { recid: updatedPosfile.recid },
      updatedPosfile
    );

    await computeTotal(pos, {
      postrntyp: "ITEM",
      ordercde: updatedPosfile.ordercde,
      // itmcomtyp: null,
    });

    const updateTotal = await pos.findOne({
      where: {
        postrntyp: "TOTAL",
        ordercde: updatedPosfile.ordercde,
      },
    });

    // res.status(200).json({discountList, posfile: update});
    res.status(200).json({ discountList, posfile: updateTotal });
    // res.status(200).json({discountList});
  });

  router.delete("/discountdetails", async (req, res) => {
    const { orderitmid, discde } = req.query;

    const deleted = await posfileordering.Delete({
      postrntyp: "DISCOUNT",
      orderitmid,
      discde,
    });

    res.status(200).json(deleted);
  });

  router.delete("/discountDeleteAll/:ordercde", async (req, res) => {
    const { ordercde } = req.params;

    const deleted = await posfile.GetInstance().destroy({
      where: { postrntyp: "DISCOUNT", ordercde },
    });

    res.status(200).json(deleted);
  });

  router.post("/freeTransaction", async (req, res) => {
    const freeObj = req.body;

    const data = await freeAllItem(freeObj);
    res.status(200).json(data);
  });

  router.put("/freeItem", async (req, res) => {
    const item = req.body;
    const updatedItem = await posfileordering.CreateOrUpdate(
      { recid: item.recid },
      item
    );

    await computeTotal(posfileordering, {
      postrntyp: "ITEM",
      ordercde: updatedItem.dataValues.ordercde,
      // itmcomtyp: null,
    });

    res.status(200).json(updatedItem);
  });

  router.get("/remainingZread", async (req, res) => {
    let retObj = false;
    const pos = posfile.GetInstance();

    const findSyspar = await syspar.findOne({});

    const find = await pos.findOne({
      where: {
        batchnum: "",
        trndte: { [Op.ne]: format(new Date(), "yyyy-MM-dd") },
        // postrntyp: {[Op.not]: "REFUND"}
        postrntyp: "CASHFUND",
      },
    });

    // Has remaining zread will trigger if time now is >= endtime and >= fetchedData+1day start time

    console.log("findOne", find);

    if (find) {
      const date = find ? find.trndte : null;

      console.log(date);

      const fetchedDate = new Date(find.trndte);
      // fetchedDate.setHours(0,0,0,0)
      const dateNow = new Date();

      const timeToday = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      //10:00:00
      const startTime = findSyspar.timestart;
      const endTime = findSyspar.timeend;
      const extensionTime = findSyspar.timeextension;
      const isExtended = findSyspar.isExtended;
      let currentEndTime = isExtended ? extensionTime : endTime;

      // Calculate the difference in milliseconds
      const diffInMilliseconds = dateNow.getTime() - fetchedDate.getTime();

      // Convert the difference to days
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

      console.log("Diff in days", diffInDays);

      if (diffInDays > 1) {
        retObj = true;
        return res.status(200).json({
          hasRemainingZread: retObj,
          date: date,
          time: findSyspar.timestart,
          timeEnd: findSyspar.timeend,
          hehe: "aHEHE",
        });
      }

      // const timeStart = "08:00:00";
      // const timeEnd = "12:00:00";

      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = currentEndTime.split(":").map(Number);

      const startConvertedMinutes =
        startHours >= 24 ? startMinutes : startHours * 60 + startMinutes;

      const endConvertedMinutes = endHours * 60 + endMinutes;
      const nowTime = convertToMinutes(timeToday);

      console.log("Now time", nowTime, startHours);
      console.log("End time", endConvertedMinutes);
      console.log("Start time", startConvertedMinutes);

      //9:00:00 21:00:00 error: 11:00:00
      // start: 14:00:00
      // end: 13:40:00

      if (nowTime > startConvertedMinutes) {
        retObj = true;
        return res.status(200).json({
          hasRemainingZread: retObj,
          date: date,
          time: findSyspar.timestart,
          timeEnd: findSyspar.timeend,
        });
      } else {
        return res.status(200).json({
          hasRemainingZread: false,
          date: date,
          time: findSyspar.timestart,
          timeEnd: findSyspar.timeend,
        });
      }
    } else {
      return res.status(200).json({
        hasRemainingZread: false,
        date: "",
        time: findSyspar.timestart,
        timeEnd: findSyspar.timeend,
      });
    }
  });

  router.put("/transaction", async (req, res) => {
    enqueue({ req, res });

    if (!isProcessing) {
      processQueue();
    }
  });

  router.put("/add_scharge_disc", async (req, res) => {
    const datas = req.body;

    let hasError = false;
    for (const data of datas) {
      const result = await pos.update(data, { where: { recid: data.recid } });

      if (!result) {
        hasError = true;
        break;
      }
    }

    if (hasError) {
      return res.status(500).json({ success: false });
    }

    res.status(200).json({ success: true });
  });

  router.put("/change", async (req, res) => {
    const request = req.body;
    const posCreated = await posfileordering.GetInstance().create(request);
    // const sys = await syspar.findOne({});
    // _log("change:docnum: " + sys.posdocnum);

    if (posCreated) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false });
    }
  });

  router.put("/transactionBulk", async (req, res) => {
    // let find = [];

    // Get the headerfile for the warcode and the tenant number

    const { baseItemPosfile, baseCombo } = req.body;

    const findSyspar = await syspar.findOne({});
    const count = await posDaily.count({
      where: { ordercde: baseItemPosfile.ordercde },
    });

    let netvatamt = 0;
    let vatamt = 0;
    let vatexempt = 0;

    const idHolder = {
      itemId: uuidv4(),
    };

    if (baseItemPosfile.taxcde == "VATABLE") {
      netvatamt =
        (baseItemPosfile.untprc * baseItemPosfile.itmqty) /
        (1 + findSyspar.vatrte / 100);
      // vatamt = (request.untprc * request.itmqty) * (1 - 1 /(1+findSyspar[0].vatrte/100))
      // vatamt =
      //   baseItemPosfile.untprc *
      //   baseItemPosfile.itmqty *
      //   (1 - 1 / (1 + findSyspar.vatrte / 100));
      vatamt = baseItemPosfile.untprc * baseItemPosfile.itmqty - netvatamt;
    } else if (baseItemPosfile.taxcde == "VAT EXEMPT") {
      vatexempt = baseItemPosfile.untprc * baseItemPosfile.itmqty;
    }

    let serviceCharge = 0;

    if (baseItemPosfile.ordertyp == "DINEIN") {
      serviceCharge =
        (vatexempt != 0 ? vatexempt : netvatamt) *
        (findSyspar.dinein_scharge / 100);
    } else {
      serviceCharge =
        (vatexempt != 0 ? vatexempt : netvatamt) *
        (findSyspar.takeout_scharge / 100);
    }

    const updatedRequest = {
      ...baseItemPosfile,
      orderitmid: idHolder.itemId,
      // grossprc: baseItemPosfile.untprc,
      // untprc: baseItemPosfile.untprc,
      // groprc: baseItemPosfile.untprc,
      // extprc: baseItemPosfile.untprc,
      // groext: baseItemPosfile.untprc,
      netvatamt: netvatamt,
      vatamt: vatamt,
      vatexempt: vatexempt,
      scharge: serviceCharge,
      trncde: "POS",
    };

    const templateObject = {
      ordercde: baseItemPosfile.ordercde,
      brhcde: baseItemPosfile.brhcde ?? "",
      itmcde: "",
      itmqty: 1,
      voidqty: 0,
      grossprc: 0,
      groprc: 0,
      untprc: 0,
      vatrte: 0,
      ordertyp: baseItemPosfile.ordertyp,
      memc: baseItemPosfile.memc,
      taxcde: null,
      itmpaxcount: baseItemPosfile.itmpaxcount,
      isaddon: false,
      mainitmcde: baseItemPosfile.itmcde,
      postypcde: baseItemPosfile.postypcde,
      warcde: baseItemPosfile.warcde,
      docnum: baseItemPosfile.docnum,
      billdocnum: baseItemPosfile.billdocnum,
      trndte: baseItemPosfile.trndte,
      logtim: baseItemPosfile.logtim,
      cashier: baseItemPosfile.cashier || "sampleUser",
      numpax: 1,
      postrmno: baseItemPosfile.postrmno,
      bnkcde: baseItemPosfile.bnkcde,
      itmnum: baseItemPosfile.itmnum,
      trncde: "POS",
    };

    if (count <= 0) {
      const array = [
        {
          ...templateObject,
          itmcde: "TOTAL",
          postrntyp: "TOTAL",
          itmqty: 0,
          groext: baseItemPosfile.groext,
          extprc: baseItemPosfile.extprc,
          untprc: baseItemPosfile.untprc,
          groprc: baseItemPosfile.groprc,
          ordocnum: findSyspar.ordocnum,
        },
        {
          ...templateObject,
          itmcde: "SERVICE CHARGE",
          postrntyp: "SERVICE CHARGE",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "VATEXEMPT",
          postrntyp: "VATEXEMPT",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "LOCALTAX",
          postrntyp: "LOCALTAX",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "VAT 0 RATED",
          postrntyp: "VAT 0 RATED",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "DISCOUNTABLE",
          postrntyp: "DISCOUNTABLE",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "Less Vat Adj.",
          postrntyp: "Less Vat Adj.",
          itmqty: 1,
        },
        updatedRequest,
      ];

      await posDaily.bulkCreate(array);
    } else {
      await posfileordering.CreateOrUpdate(
        { recid: baseItemPosfile.recid },
        updatedRequest
      );
    }

    // bulk
    baseCombo.forEach(async (request) => {
      const { recid } = request;

      if (request.taxcde == "VATABLE") {
        netvatamt =
          (request.untprc * request.itmqty) / (1 + findSyspar.vatrte / 100);
        // vatamt = (request.untprc * request.itmqty) * (1 - 1 /(1+findSyspar[0].vatrte/100))
        // vatamt =
        //   request.untprc *
        //   request.itmqty *
        //   (1 - 1 / (1 + findSyspar.vatrte / 100));
        vatamt = request.untprc * request.itmqty - netvatamt;
      } else if (request.taxcde == "VAT EXEMPT") {
        vatexempt = request.untprc * request.itmqty;
      }

      if (request.ordertyp == "DINEIN") {
        serviceCharge =
          (vatexempt != 0 ? vatexempt : netvatamt) *
          (findSyspar.dinein_scharge / 100);
      } else {
        serviceCharge =
          (vatexempt != 0 ? vatexempt : netvatamt) *
          (findSyspar.takeout_scharge / 100);
      }

      if (request.itmcomtyp === "UPGRADE") {
        const updatedRequest = {
          ...request,
          orderitmid: idHolder.itemId,
          grossprc: request.untprc,
          untprc: request.untprc,
          groprc: request.untprc,
          extprc: request.extprc,
          groext: request.extprc,
          netvatamt: netvatamt,
          vatamt: vatamt,
          vatexempt: vatexempt,
          scharge: serviceCharge,
          trncde: "POS",
        };
        find = await posfileordering.CreateOrUpdate(
          { recid: recid },
          updatedRequest
        );
      } else {
        const updatedRequest = {
          ...request,
          orderitmid: idHolder.itemId,
          grossprc: request.untprc,
          untprc: request.untprc,
          groprc: request.untprc,
          extprc: request.untprc,
          groext: request.untprc,
          netvatamt: netvatamt,
          vatamt: vatamt,
          vatexempt: vatexempt,
          scharge: serviceCharge,
          trncde: "POS",
        };
        find = await posfileordering.CreateOrUpdate(
          { recid: recid },
          updatedRequest
        );
      }
    });

    try {
      await computeTotal(posDaily, {
        postrntyp: "ITEM",
        ordercde: baseItemPosfile.ordercde,
        // itmcomtyp: null,
      });
    } catch (e) {
      console.error(e);
    }

    const newFind = await posDaily.findAll({
      where: {
        ordercde: baseItemPosfile.ordercde,
        postrntyp: "ITEM",
        orderitmid: idHolder.itemId,
      },
    });

    res.status(200).json(newFind);
  });

  router.put("/ordertypebulkcombo", async (req, res) => {
    const { posfileBulkCombo } = req.body;

    const orignalBaseItem = posfileBulkCombo[0].itm;

    const originalItemCombo = await pos.findAll({
      where: {
        ordercde: orignalBaseItem.ordercde,
        postrntyp: "ITEM",
        orderitmid: orignalBaseItem.orderitmid,
        chkcombo: 0,
      },
    });

    const updatedPosfileBase = posfileBulkCombo
      .map((item) => {
        return { ...item.itm };
      })
      .map((itm) => {
        return {
          ...itm,
          extprc: itm.untprc * itm.itmqty,
          groext: itm.untprc * itm.itmqty,
        };
      });

    let newItemCombo = [];

    const filteredOriginalBase = updatedPosfileBase.filter(
      (item) => item.recid === undefined
    );

    filteredOriginalBase.forEach((item) => {
      originalItemCombo.forEach((itm) => {
        const cloneItem = { ...itm.dataValues };
        cloneItem.orderitmid = item.orderitmid;
        cloneItem.ordertyp = item.ordertyp;
        cloneItem.recid = undefined;
        newItemCombo.push(cloneItem);
      });
    });

    // console.log("original na combo", originalItemCombo);
    const comboBasePosfile = [...updatedPosfileBase, ...newItemCombo];

    // console.log("combo na base", comboBasePosfile);
    // console.log("combo na base haba", comboBasePosfile.length);

    const promisePosfileComboBase = comboBasePosfile.map(async (item) => {
      return await posfile.CreateOrUpdate({ recid: item.recid }, item);
    });

    await Promise.all(promisePosfileComboBase);

    res.status(200).json({ msg: req.body });
  });

  router.get("/day/:ordercde/", async (req, res) => {
    const { ordercde } = req.params;

    const pos = posfileordering.GetInstance();
    const formattedDate = format(new Date(), "yyyy-MM-dd");

    const itemInstance = modelList.item.instance.GetInstance();

    const dayTransaction = await pos.findAll({
      where: {
        ordercde: ordercde,
        // trndte: formattedDate,
        postrntyp: "ITEM",
        //batchnum: "",
      },
      include: [
        {
          model: itemInstance,
        },
      ],
    });

    const newTransaction = await Promise.all(
      dayTransaction.map(async (item) => {
        const findItemDisc = await pos.findAll({
          where: {
            ordercde: ordercde,
            orderitmid: item.orderitmid,
            postrntyp: "DISCOUNT",
            refund: 0,
          },
          attributes: ["itmcde", "cardholder", "cardno", "govdisc", "tin"],
        });
        item.dataValues.posDiscount = findItemDisc;

        return item;
      })
    );
    res.status(200).json(newTransaction);
  });

  router.get("/previousPosfiles/:ordercde", async (req, res) => {
    const { ordercde } = req.params;
    const pos = posfile.GetInstance();
    const formattedDate = format(new Date(), "yyyy-MM-dd");
    const itemInstance = modelList.item.instance.GetInstance();

    const dayTransaction = await pos.findAll({
      where: {
        ordercde: ordercde,
        trndte: formattedDate,
        postrntyp: "ITEM",
        batchnum: "",
      },
      include: [
        {
          model: itemInstance,
        },
      ],
    });

    const newTransaction = await Promise.all(
      dayTransaction.map(async (item) => {
        const findItemDisc = await pos.findAll({
          where: {
            ordercde: ordercde,
            orderitmid: item.orderitmid,
            postrntyp: "DISCOUNT",
            refund: 0,
          },
          attributes: ["itmcde", "cardholder", "cardno", "tin"],
        });
        const findPayment = await pos.findOne({
          where: {
            ordercde: ordercde,
            postrntyp: "PAYMENT",
            refund: 0,
          },
          attributes: ["customername", "itmcde", "ordercde"],
        });

        item.dataValues.posDiscount = findItemDisc;
        item.dataValues.customername = findPayment?.customername || "";

        return item;
      })
    );

    res.status(200).json(newTransaction);
  });

  router.get("/zreading", async (req, res) => {
    const pos = posfile.GetInstance();

    const count = await pos.count({ where: { batchnum: "", trnstat: 1 } });
    let find;

    if (count > 0) {
      find = await pos.findAll({
        where: {
          batchnum: "",
          trnstat: 1,
        },
        order: ["recid"],
        attributes: ["trndte"],
      });
    }

    res.status(200).json(find);
  });

  router.get("/recomputeZReading", async (req, res) => {
    const { _distinct, ...otherQueries } = req.query;
    const filtered = new Filter(otherQueries);

    const distinct =
      _distinct !== "-1"
        ? {
            attributes: [
              [fn("DISTINCT", col(req.query._distinct)), req.query._distinct],
            ],
          }
        : {};

    const filterObj = {
      ...filtered.Get(),
      ...distinct,
    };

    const findQ = await posfile.ReadMany(filterObj);
    res.status(200).json(findQ.rows);
  });

  router.post("/zreading", async (req, res) => {
    const { cashier, extprc, postrmno, brhcde, date, time, batchnum, noEOD } =
      req.query;
    const pos = posfile.GetInstance();

    let noTransactionData;
    let distinctDate;
    let totalReprinted = { amt: 0, count: 0 };

    //#region Z-read the unpost posfile data by putting a batch number
    if (noEOD === "true") {
      const unpostPosFiles = await pos.findAll({
        where: {
          batchnum: "",
          trnstat: 1,
        },
      });

      totalReprinted = unpostPosFiles
        .filter((a) => a.postrntyp === "TOTAL")
        .map((a) => [a.reprinted_amt, a.reprinted])
        .reduce(
          (acc, curr) => {
            if (!curr) return acc;

            acc.amt += curr[0] * 1;
            acc.count += curr[1] * 1;
            return acc;
          },
          { amt: 0, count: 0 }
        );

      distinctDate = [...new Set(unpostPosFiles.map((item) => item.trndte))];

      for (const unpostPosFile of unpostPosFiles) {
        unpostPosFile.batchnum = batchnum;
        await unpostPosFile.save();
      }
    } else {
      noTransactionData = {
        batchnum: batchnum,
        postrntyp: "NOTRANSACTION",
        itmcde: "NOTRANSACTION",
        extprc: 0,
        trndte: date,
        logtim: "00:00:00",
        cashier: cashier,
        postrmno: postrmno,
        brhcde: brhcde,
        trnstat: 1,
        upload_status: "posted",
      };
    }
    //#endregion

    //#region CREATE GRANDTOTAL RECORD
    const zreadRecord = {
      batchnum: batchnum,
      postrntyp: "GRANDTOTAL",
      itmcde: "GRANDTOTAL",
      extprc: extprc,
      trndte: distinctDate ? distinctDate[0] : date,
      logtim: time,
      cashier: cashier,
      postrmno: postrmno,
      brhcde: brhcde,
      trnstat: 1,
      upload_status: "posted",
      reprinted_amt: totalReprinted.amt,
      reprinted: totalReprinted.count,
    };
    //#endregion

    const data = [];
    noTransactionData && data.push(noTransactionData);
    data.push(zreadRecord);

    const mappedData = data.map((item) => {
      if (item.recid) return item;

      return { ...item, docnum: uuidv4() };
    });

    await pos.bulkCreate(mappedData, {
      updateOnDuplicate: ["recid", "batchnum"],
    });

    //#region Close open transaction
    await transaction.update(
      {
        status: "CLOSED",
        closetime: dateTimeTodayFormatter(),
      },
      {
        where: {
          status: {
            [Op.or]: ["OPEN", "HOLD", "RECALL"],
          },
        },
      }
    );
    //#endregion

    res.status(200).json(zreadRecord);
  });

  // use to update the grand total -> used by recompute zreading module
  router.put("/zreading", async (req, res) => {
    const updatedData = posfile.Update(
      {
        postrntyp: "GRANDTOTAL",
        batchnum: req.query.batchnum,
      },
      req.body
    );

    if (updatedData) {
      res.status(200).json({ success: true });
      return;
    }

    res.status(200).json({ success: false });
  });

  router.get("/reprint_zreading/search/:searchTerm", async (req, res) => {
    const { searchTerm } = req.params;
    const { page, pageSize } = req.query;

    const searched = await pos.findAll(
      paginate(
        {
          where: {
            batchnum: { [Op.like]: "%" + searchTerm + "%" },
            postrntyp: "GRANDTOTAL",
          },
          order: [[col("trndte"), "DESC"]],
          raw: true,
        },
        { page, pageSize }
      )
    );

    const data = [];
    for (const searchData of searched) {
      const posfiles = await pos.findAll({
        where: {
          batchnum: searchData.batchnum,
          postrntyp: {
            [Op.ne]: "GRANDTOTAL",
          },
        },
        order: [[col("logtim"), "DESC"]],
        raw: true,
      });

      const maxPosfile = posfiles[0];
      const minPosfile = posfiles[posfiles.length - 1];

      const _data = {
        batchnum: searchData.batchnum,
        fromDateTime: dateFormatter(
          `${minPosfile.trndte} ${minPosfile.logtim}`,
          "yyyy-MM-dd hh:mm:ss aaaaa'm'"
        )
          .replace("am", "AM")
          .replace("pm", "PM"),
        toDateTime: dateFormatter(
          `${maxPosfile.trndte} ${maxPosfile.logtim}`,
          "yyyy-MM-dd hh:mm:ss aaaaa'm'"
        )
          .replace("am", "AM")
          .replace("pm", "PM"),
      };

      data.push(_data);
    }

    res.status(200).json(data);
  });

  // router.get("/reprint_zreading", async (req, res) => {
  //   const pos = posfile.GetInstance();
  //   const {page, pageSize} = req.query;

  //   // log current time in ms
  //   const dateNow = new Date().getTime();

  //   const grandtotals = await pos.findAll(
  //     paginate(
  //       {
  //         where: {
  //           postrntyp: "GRANDTOTAL",
  //         },
  //         order: [[col("trndte"), "DESC"]],
  //         raw: true,
  //       },
  //       {page: page, pageSize: pageSize}
  //     )
  //   );

  //   const data = [];
  //   for (const grandtotal of grandtotals) {
  //     const posfiles = await pos.findAll({
  //       where: {
  //         batchnum: grandtotal.batchnum,
  //         postrntyp: {
  //           [Op.ne]: "GRANDTOTAL",
  //         },
  //       },
  //       order: [[col("logtim"), "DESC"]],
  //       raw: true,
  //     });

  //     const maxPosfile = posfiles[0];
  //     const minPosfile = posfiles[posfiles.length - 1];

  //     const _data = {
  //       batchnum: grandtotal.batchnum,
  //       fromDateTime: dateFormatter(
  //         `${minPosfile.trndte} ${minPosfile.logtim}`,
  //         "yyyy-MM-dd hh:mm:ss aaaaa'm'"
  //       )
  //         .replace("am", "AM")
  //         .replace("pm", "PM"),
  //       toDateTime: dateFormatter(
  //         `${maxPosfile.trndte} ${maxPosfile.logtim}`,
  //         "yyyy-MM-dd hh:mm:ss aaaaa'm'"
  //       )
  //         .replace("am", "AM")
  //         .replace("pm", "PM"),
  //     };

  //     data.push(_data);
  //   }

  //   console.log("Time elapsed: ", new Date().getTime() - dateNow);

  //   res.status(200).json(data);
  // });

  router.get("/reprint_zreading", async (req, res) => {
    const pos = posfile.GetInstance();
    const { page, pageSize } = req.query;

    const dateNow = new Date().getTime();

    // Fetch grandtotals with pagination
    const grandtotals = await pos.findAll(
      paginate(
        {
          where: {
            postrntyp: "GRANDTOTAL",
          },
          order: [[col("trndte"), "DESC"]],
          raw: true,
        },
        { page: page, pageSize: pageSize }
      )
    );

    // Prepare all batch numbers to fetch posfiles in one go
    const batchNums = grandtotals.map((grandtotal) => grandtotal.batchnum);

    // Fetch all posfiles in one query using batchnum filter
    const posfiles = await pos.findAll({
      where: {
        batchnum: {
          [Op.in]: batchNums,
        },
        postrntyp: {
          [Op.ne]: "GRANDTOTAL",
        },
      },
      order: [[col("logtim"), "DESC"]],
      raw: true,
    });

    // Organize posfiles by batchnum for easier access
    const posfilesByBatch = {};
    posfiles.forEach((file) => {
      if (!posfilesByBatch[file.batchnum]) {
        posfilesByBatch[file.batchnum] = [];
      }
      posfilesByBatch[file.batchnum].push(file);
    });

    const data = grandtotals
      .map((grandtotal) => {
        const files = posfilesByBatch[grandtotal.batchnum];
        if (!files || files.length === 0) return null;

        const maxPosfile = files[0];
        const minPosfile = files[files.length - 1];

        return {
          batchnum: grandtotal.batchnum,
          fromDateTime: dateFormatter(
            `${minPosfile.trndte} ${minPosfile.logtim}`,
            "yyyy-MM-dd hh:mm:ss aaaaa'm'"
          )
            .replace("am", "AM")
            .replace("pm", "PM"),
          toDateTime: dateFormatter(
            `${maxPosfile.trndte} ${maxPosfile.logtim}`,
            "yyyy-MM-dd hh:mm:ss aaaaa'm'"
          )
            .replace("am", "AM")
            .replace("pm", "PM"),
        };
      })
      .filter((item) => item !== null);

    console.log("Time elapsed: ", new Date().getTime() - dateNow);

    res.status(200).json(data);
  });

  router.get("/reprint_zreading/:batchnum", async (req, res) => {
    const { batchnum } = req.params;
    const pos = posfile.GetInstance();

    const find = await pos.findAll({
      where: {
        batchnum: batchnum,
        postrntyp: {
          [Op.ne]: "GRANDTOTAL",
        },
      },
    });

    res.status(200).json(find);
  });

  router.get("/total", async (req, res) => {
    const openTran = await transaction.findOne({
      where: {
        status: {
          [Op.or]: ["RECALL", "OPEN"],
        },
      },
      order: [["status", "DESC"]],
    });

    if (openTran) {
      const findTotal = await posfileordering.GetInstance().findOne({
        where: {
          postrntyp: "TOTAL",
          batchnum: "",
          ordercde: openTran.ordercde,
        },
      });

      res.status(200).json(findTotal);

      return;
    }

    res.status(400).json({ err: "No active transaction" });
  });

  router.get("/total/:postrntyp", async (req, res) => {
    const { postrntyp } = req.params;
    const { ordercde } = req.query;

    let openTran, findTotal;

    if (ordercde) {
      openTran = await transaction.findOne({ where: { ordercde: ordercde } });
    } else {
      openTran = await transaction.findOne({
        where: {
          status: {
            [Op.or]: ["RECALL", "OPEN"],
          },
        },
        order: [["status", "DESC"]],
      });
    }

    try {
      findTotal = await posfileordering.GetInstance().findOne({
        where: {
          postrntyp: postrntyp,
          batchnum: "",
          ordercde: openTran.ordercde,
        },
      });

      res.status(200).json(findTotal);
    } catch (e) {
      res.status(400).json({ err: "No active transaction" });
    }
  });

  router.get(`/previousTotal/:ordercde`, async (req, res) => {
    const findSyspar = await syspar.findOne({});

    const { ordercde } = req.params;

    const findTotal = await pos.findOne({
      where: { postrntyp: "TOTAL", batchnum: "", ordercde: ordercde },
    });

    res.status(200).json(findTotal);
  });

  router.get("/lastTransact", async (req, res) => {
    const pos = posfile.GetInstance();
    const findSyspar = await syspar.findOne({});

    console.log("Natawag ba to??");

    // check if the time is already past the time start (24hr format e.g. 00:00:00)
    const timeStart = findSyspar.timestart;
    const timeToday = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    let lastTransaction = await pos.findOne({
      where: {
        trndte: dateTodayFormatter(),
      },
      order: [
        ["trndte", "DESC"],
        ["logtim", "DESC"],
      ],
    });

    // if there's no transaction for today, get the transactions from previous days
    if (lastTransaction === null) {
      lastTransaction = await pos.findOne({
        order: [
          ["trndte", "DESC"],
          ["logtim", "DESC"],
        ],
        raw: true,
      });

      if (lastTransaction && lastTransaction.itmcde === "GRANDTOTAL") {
        if (timeToday >= timeStart) {
          return res.status(200).json({ trntyp: "EMPTY" });
        }
      }
    }

    res
      .status(200)
      .json(
        lastTransaction !== null
          ? { trntyp: lastTransaction.itmcde }
          : { trntyp: "EMPTY" }
      );
  });

  router.get("/grandtotal", async (req, res) => {
    const { from, to } = req.query;
    // const grandTotalFind = await pos.findOne({where: {
    //   // trndte: {
    //   //   [Op.and]: [
    //   //     {
    //   //       [Op.gte]: from,
    //   //       [Op.lte]: to,
    //   //     },
    //   //   ],
    //   // },
    //   trndte: from,
    //   postrntyp: "GRANDTOTAL"
    // }})
    const grandTotalFind = await pos.findAll({
      where: {
        trndte: {
          [Op.and]: [
            {
              [Op.gte]: from,
              [Op.lte]: to,
            },
          ],
        },
        postrntyp: "GRANDTOTAL",
      },
      raw: true,
      attributes: ["batchnum", "trndte"],
    });

    res.status(200).json(grandTotalFind);
  });

  router.get("/hourly", async (req, res) => {
    const { date } = req.query;
    const posfile = await pos.findOne({
      where: {
        trndte: dateFormatter(date, "yyyy-MM-dd"),
        postrntyp: "TOTAL",
      },
      raw: true,
      attributes: ["batchnum", "trndte", "trncde"],
    });
    console.log(posfile);
    if (posfile !== null) {
      const time = await timelogfile.findAll({
        where: {
          trndte: posfile.trndte,
        },
        raw: true,
      });
      console.log(time);
      const timeLogFile = time.map((value) => ({
        ...value,
        batchnum: posfile.batchnum,
      }));
      res.status(200).json(timeLogFile);
    } else {
      res.status(200).json([]);
    }
  });

  router.get("/filter", async (req, res) => {
    const filter = new Filter(req.query);
    const item = modelList.item.instance.GetInstance();
    const itemclass = modelList.itemclassification.instance.GetInstance();
    const itemsubclass = modelList.itemsubclassification.instance.GetInstance();
    const specialrequestdetail =
      modelList.specialrequestdetail.instance.GetInstance();

    const filterObj = {
      ...filter.Get(),
      include: [
        { model: item, include: [itemclass, itemsubclass] },
        { model: specialrequestdetail },
      ],
    };

    const { _distinct, ...whereObj } = filterObj.where;
    const order = filterObj.order;
    const include = filterObj.include;

    console.log("PAREH", filterObj);

    if (filter.query["_distinct"]) {
      const posfile = await modelList.posfile.instance
        .GetInstance()
        .aggregate(filter.query["_distinct"], "DISTINCT", {
          plain: false,
          whereObj,
          order,
          include,
        });

      console.log("PAREH SAN KA NA?", posfile);

      const store = [];
      posfile.forEach((value) => store.push(value["DISTINCT"]));
      res.status(200).json(store);
    } else {
      const result = await posfile.ReadMany(filterObj);
      res.status(200).json(result.rows);
    }
  });

  router.get("/auto_ofsales", async (req, res) => {
    const { page, pageSize, startDate, endDate, ...otherQueries } = req.query;
    const filter = new Filter(otherQueries);
    const item = modelList.item.instance.GetInstance();
    const itemclass = modelList.itemclassification.instance.GetInstance();
    const itemsubclass = modelList.itemsubclassification.instance.GetInstance();
    const specialrequestdetail =
      modelList.specialrequestdetail.instance.GetInstance();

    let filterObj;

    // to be used in home page for getting corrupted autoof_sales files
    if (!page && !pageSize) {
      filterObj = {
        ...filter.Get(),
        include: [
          { model: item, include: [itemclass, itemsubclass] },
          { model: specialrequestdetail },
        ],
      };

      const result = await posfile.GetInstance().findAll(filterObj);
      res.status(200).json(result);
    } else {
      // to be used in autoof_sales module

      const { where, ...otherFilter } = filter.Get();

      filterObj = paginate(
        {
          where: {
            ...where,
            ...(startDate && {
              trndte: {
                [Op.between]: [startDate, endDate],
              },
            }),
          },
          ...otherFilter,
          distinct: true,
        },
        { page: page || 0, pageSize: pageSize || "10" }
      );

      let result = await posfile.GetInstance().findAll(filterObj);

      result = await Promise.all(
        result.map(async (pos) => {
          const _pos = pos.dataValues;

          // find the itemfile for this posfile (pos)
          const itemfile = await item.findOne({
            where: { itmcde: _pos.itmcde },
            raw: true,
          });
          // find the orderitemmodifierfile (special request) for this posfile
          const orderitemmodifierfiles = await specialrequestdetail.findAll({
            where: { ordercde: _pos.ordercde },
            raw: true,
          });

          return {
            ..._pos,
            itemfile,
            orderitemmodifierfiles,
          };
        })
      );

      res.status(200).json(result);
    }
  });

  router.get("/orderreport", async (req, res) => {
    const pos = posfile.GetInstance();
    const syspar = await modelList.systemparameters.instance
      .GetInstance()
      .findOne({ where: { recid: 1 }, raw: true });

    let result = [];

    const uniqueBatch = await pos.findAll({
      where: {
        trndte: {
          [Op.and]: [
            {
              [Op.gte]: req.query.dtefrom,
              [Op.lte]: req.query.dteto,
            },
          ],
        },
        postrntyp: "ITEM",
        void: 0,
        refund: 0,
        trnstat: 1,
        // trncde: "POS",
      },
      attributes: [
        [fn("DISTINCT", col("batchnum")), "batchnum"],
        "logtim",
        "trndte",
      ],
      order: ["recid"],
      raw: true,
    });

    let xarr_posfile = [];
    for (let index = 0; index < uniqueBatch.length; index++) {
      let batchno = uniqueBatch[index].batchnum;
      if (index == 0) {
        const posfile2 = await pos.findOne({
          where: {
            trndte: {
              [Op.and]: [
                {
                  [Op.gte]: req.query.dtefrom,
                  [Op.lte]: req.query.dteto,
                },
              ],
            },
            postrntyp: "ITEM",
            void: 0,
            refund: 0,
            trnstat: 1,
            batchnum: batchno,
          },
          order: [["recid", "DESC"]],
          attributes: ["batchnum", "logtim", "trndte"],
          raw: true,
        });

        if (posfile2.logtim < syspar.timestart) {
          continue;
        }
      }

      const posfile3 = await pos.findAll({
        where: {
          batchnum: batchno,
          postrntyp: "ITEM",
          void: 0,
          refund: 0,
          trnstat: 1,
        },
        include: {
          all: true,
          nested: true,
        },
      });
      xarr_posfile.push(...posfile3);
    }

    for (let item of xarr_posfile) {
      let x_item = item.dataValues;
      let index = result.findIndex(
        (obj) =>
          obj.usrcde === x_item.cashier &&
          obj.ordertyp === x_item.ordertyp &&
          obj.trndte === x_item.trndte
      );
      if (index > -1) {
        let res1 = result[index].orders;
        result[index].orders = res1.concat(x_item);
      } else {
        result.push({
          orders: [x_item],
          usrcde: x_item.cashier,
          ordertyp: x_item.ordertyp,
          trndte: x_item.trndte,
        });
      }
    }

    for (let item of result) {
      const uniqueRecIds = new Set();

      item.orders = item.orders.filter((order) => {
        if (!uniqueRecIds.has(order.recid)) {
          uniqueRecIds.add(order.recid);
          return true;
        }
        return false;
      });
    }

    // if (req.query.type === "summary") {
    //   console.log(result);
    //   result.forEach((value, i) => {
    //     let ordersfile2 = [];
    //     for (const x of value.orders) {
    //       let index = ordersfile2.findIndex((obj) => obj.itmcde === x.itmcde);
    //       if (index > -1) {
    //         ordersfile2[index].itmqty += x.itmqty;
    //         ordersfile2[index].extprc += x.extprc;
    //         ordersfile2[index].untprc = ordersfile2[index].untprc
    //           ? ordersfile2[index].untprc
    //           : x.untprc;
    //       } else {
    //         ordersfile2.push({
    //           itmqty: x.itmqty,
    //           untprc: x.untprc,
    //           extprc: x.extprc,
    //           sendtime: x.sendtime,
    //           itmcde: x.itmcde,
    //           itmdsc: x.itemfile.itmdsc,
    //         });
    //       }
    //     }
    //     result[i].orders = ordersfile2;
    //     ordersfile2 = [];
    //   });
    // }
    // console.log("RESULTTT", result);
    if (req.query.type === "summary") {
      // initialize data
      for (let itemType of result) {
        itemType.orders = itemType.orders.map((item) => {
          return {
            itmdsc: item.itmdsc,
            itmqty: item.itmqty,
            untprc: item.untprc,
            itmcde: item.itmcde,
            extprc: item.extprc,
          };
        });
      }
      // manipulate computation
      const condenseOrders = (orders) => {
        const condensedOrders = [];
        orders.forEach((order) => {
          const existingItem = condensedOrders.find(
            (item) => item.itmdsc === order.itmdsc
          );
          if (existingItem) {
            // If the item with the same 'itmdsc' already exists, update 'itmqty' and 'extprc'
            existingItem.itmqty = (
              parseFloat(existingItem.itmqty) + parseFloat(order.itmqty)
            ).toFixed(5);
            existingItem.extprc = (
              parseFloat(existingItem.extprc) + parseFloat(order.extprc)
            ).toFixed(5);
          } else {
            // If it doesn't exist, add the item to the condensed orders array
            condensedOrders.push({ ...order });
          }
        });

        return condensedOrders;
      };

      // Condense 'orders' array foreach object in the main array
      const condensedData = result.map((obj) => ({
        ...obj,
        orders: condenseOrders(obj.orders),
      }));

      return res.send(condensedData);
    }
    return res.send(result);
  });

  router.put("/", async (req, res) => {
    try {
      const findSyspar = await syspar.findOne({});
      const { disc_deletion, ...reqBody } = req.body;
      const request = reqBody;

      let netvatamt = 0;
      let vatamt = 0;
      let vatexempt = 0;
      let serviceCharge = 0;

      if (req.body.taxcde == "VATABLE") {
        netvatamt =
          (request.untprc * request.itmqty) / (1 + findSyspar.vatrte / 100);
        vatamt = request.untprc * request.itmqty - netvatamt;
      } else if (req.body.taxcde == "VAT EXEMPT") {
        vatexempt = request.untprc * request.itmqty;
      }

      if (request.ordertyp == "DINEIN") {
        serviceCharge =
          (vatexempt != 0 ? vatexempt : netvatamt) *
          (findSyspar.dinein_scharge / 100);
      } else {
        serviceCharge =
          (vatexempt != 0 ? vatexempt : netvatamt) *
          (findSyspar.takeout_scharge / 100);
      }

      if (request.chkcombo == 1) {
        const newFind = await posfileordering.findAll({
          where: {
            ordercde: request.ordercde,
            postrntyp: "ITEM",
            orderitmid: request.orderitmid,
            chkcombo: 0,
          },
        });

        const comboMealItems = newFind.map((item) => {
          const clone = { ...item.dataValues };
          clone.ordertyp = request.ordertyp;
          clone.itmqty = request.itmqty;
          return clone;
        });

        const updatePromise = comboMealItems.map(async (item) => {
          return await posfileordering.CreateOrUpdate(
            { recid: item.recid },
            item
          );
        });
        await Promise.all(updatePromise);
      }

      const { recid } = req.body;
      let returnClone = {
        ...req.body,
        groext: req.body.groprc * req.body.itmqty,
        extprc: disc_deletion
          ? req.body.extprc
          : req.body.groprc * req.body.itmqty,
        netvatamt: netvatamt,
        vatamt: vatamt,
        vatexempt: vatexempt,
        scharge: serviceCharge,
      };

      // CASHIERING PART
      const isCashiering =
        req.body.postrntyp === "CASHFUND" ||
        req.body.postrntyp === "CASHIN" ||
        req.body.postrntyp === "CASHOUT" ||
        req.body.postrntyp === "DECLARATION";
      if (isCashiering) {
        if (req.body.postrntyp === "DECLARATION") {
          //#region Delete unclosed transactions in posfiletable
          await posfileordering.GetInstance().destroy({
            where: {
              trnstat: 0,
            },
          });
          //#endregion

          const unpostedPosfiles = await pos.findAll({
            where: {
              batchnum: "",
              trnstat: 1,
            },
            attributes: ["trndte", "logtim"],
            order: [["logtim", "DESC"]],
            raw: true,
          });

          const distinctDate = [
            ...new Set(unpostedPosfiles.map((posfile) => posfile.trndte)),
          ];
          const currentTimeStr = unpostedPosfiles[0].logtim;
          let [chours, cminutes, cseconds] = currentTimeStr.split(":");
          const isSecMoreThan59 = parseInt(cseconds) + 1 === 60;
          cseconds = isSecMoreThan59 ? 0 : parseInt(cseconds) + 1;

          const isMinMoreThan59 = parseInt(cminutes) + 1 === 60;
          cminutes = isSecMoreThan59
            ? isMinMoreThan59
              ? 0
              : parseInt(cminutes) + 1
            : parseInt(cminutes);

          const isHourMoreThan24 = parseInt(chours) + 1 === 25;
          chours = isMinMoreThan59
            ? isHourMoreThan24
              ? 0
              : parseInt(chours) + 1
            : parseInt(chours);

          const now = new Date();
          const posfileDate = new Date(distinctDate[0]);

          if (now.getDate() - posfileDate.getDate() > 0) {
            returnClone = {
              ...req.body,
              trndte: distinctDate[0],
              logtim: `${chours}:${cminutes}:${cseconds}`,
              docnum: uuidv4(),
            };
          } else {
            returnClone = {
              ...req.body,
              docnum: uuidv4(),
            };
          }
        } else {
          returnClone = {
            ...req.body,
            docnum: uuidv4(),
          };
        }
      }
      // CASHIERING PART END

      let update;
      if (isCashiering || req.body.postrntyp === "REFUND") {
        update = await posfile.CreateOrUpdate({ recid: recid }, returnClone);
      } else {
        update = await posfileordering.CreateOrUpdate(
          { recid: recid },
          returnClone
        );
      }

      if (update.dataValues.postrntyp == "ITEM") {
        await computeTotal(posfileordering.GetInstance(), {
          postrntyp: "ITEM",
          ordercde: update.dataValues.ordercde,
          // itmcomtyp: null,
        });
      }

      res.status(200).json(update);
    } catch (e) {
      console.error("Error in creating or updating : ", e);
    }
  });

  router.post("/changeordertype", async (req, res) => {
    const request = req.body[0];

    const findSyspar = await syspar.findOne({});
    const findHeader = await header.findOne({});
    const count = await posfileordering
      .GetInstance()
      .count({ where: { ordercde: request.ordercde } });

    let bulkCreate = [];

    const mappedReq = req.body.map((item) => {
      let netvatamt = 0;
      let vatamt = 0;
      let vatexempt = 0;
      let serviceCharge = 0;

      if (item.taxcde == "VATABLE") {
        netvatamt = (item.untprc * item.itmqty) / (1 + findSyspar.vatrte / 100);
        vatamt = item.untprc * item.itmqty - netvatamt;
      } else if (item.taxcde == "VAT EXEMPT") {
        vatexempt = item.untprc * item.itmqty;
      }

      if (item.ordertyp == "DINEIN") {
        serviceCharge =
          (vatexempt != 0 ? vatexempt : netvatamt) *
          (findSyspar.dinein_scharge / 100);

        console.log("serviceCharge:DINEIN", serviceCharge);
      } else {
        serviceCharge =
          (vatexempt != 0 ? vatexempt : netvatamt) *
          (findSyspar.takeout_scharge / 100);

        console.log("serviceCharge:TAKEOUT", serviceCharge);
      }

      return {
        ...item,
        groext: item.groprc * item.itmqty, //groext: item.itmqty * item.untprc,
        extprc: item.groprc * item.itmqty,
        netvatamt: netvatamt, //(item.untprc * item.itmqty) / 1.12,
        vatamt: vatamt, //item.untprc * item.itmqty * (1 - 1 / 1.12),
        vatexempt: vatexempt,
        scharge: serviceCharge,
      };
    });

    const reducedReq = mappedReq.reduce(
      (acc, cur) => {
        acc.totalGroprc += cur.groprc * 1;
        acc.totalExtprc += cur.extprc * 1;
        acc.totalUntprc += cur.untprc * 1;
        acc.totalGroprc += cur.groprc * 1;

        return acc;
      },
      { totalGroext: 0, totalExtprc: 0, totalUntprc: 0, totalGroprc: 0 }
    );

    const templateObject = {
      ordercde: request.ordercde,
      brhcde: request.brhcde ?? "",
      itmcde: "",
      itmqty: 1,
      voidqty: 0,
      grossprc: 0,
      groprc: 0,
      untprc: 0,
      vatrte: 0,
      ordertyp: request.ordertyp,
      memc: request.memc,
      memc_value: request.memc_value,
      taxcde: null,
      itmpaxcount: request.itmpaxcount,
      isaddon: false,
      mainitmcde: request.itmcde,
      postypcde: request.postypcde,
      warcde: findHeader.warcde,
      docnum: request.docnum,
      billdocnum: request.billdocnum,
      trndte: request.trndte,
      logtim: request.logtim,
      cashier: request.cashier || "sampleUser",
      numpax: 1,
      postrmno: findHeader.postrmno,
      bnkcde: request.bnkcde,
      itmnum: request.itmnum,
      trncde: "POS",
    };

    if (count <= 0) {
      const array = [
        {
          ...templateObject,
          itmcde: "TOTAL",
          postrntyp: "TOTAL",
          itmqty: 0,
          groext: round2decimal(reducedReq.totalGroext),
          extprc: round2decimal(reducedReq.totalExtprc),
          untprc: round2decimal(reducedReq.totalUntprc),
          groprc: round2decimal(reducedReq.totalGroprc),
          // groext: request.groext,
          // extprc: request.extprc,
          // untprc: request.untprc,
          // groprc: request.groprc,
          // ordocnum: findSyspar.ordocnum,
        },
        {
          ...templateObject,
          itmcde: "SERVICE CHARGE",
          postrntyp: "SERVICE CHARGE",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "VATEXEMPT",
          postrntyp: "VATEXEMPT",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "LOCALTAX",
          postrntyp: "LOCALTAX",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "VAT 0 RATED",
          postrntyp: "VAT 0 RATED",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "DISCOUNTABLE",
          postrntyp: "DISCOUNTABLE",
          itmqty: 1,
        },
        {
          ...templateObject,
          itmcde: "Less Vat Adj.",
          postrntyp: "Less Vat Adj.",
          itmqty: 1,
        },
        ...mappedReq,
      ];

      bulkCreate = await posfileordering.BulkCreate(array);
    } else {
      await posfileordering.BulkCreate(mappedReq);
    }

    const openTran = await transaction.findOne({
      where: {
        status: {
          [Op.or]: ["RECALL", "OPEN"],
        },
      },
      order: [["status", "DESC"]],
    });

    await computeTotal(posfileordering.GetInstance(), {
      postrntyp: "ITEM",
      ordercde: openTran.ordercde,
      // itmcomtyp: null,
    });

    res.status(200).json(bulkCreate);
  });

  router.get("/head", async (req, res) => {
    const { page, pageSize } = req.query;

    const posfileHead = await pos.findAll(
      paginate(
        {
          where: {
            ordocnum: { [Op.ne]: "" },
            postrntyp: "TOTAL",
            voidreason: null,
            trndte: dateTodayFormatter(),
            // do not include refunded transactions
            [Op.not]: [
              {
                ordocnum: {
                  [Op.in]: literal(
                    `(SELECT ordocnum FROM posfile WHERE refund = 1 OR void = 1)`
                  ),
                },
              },
            ],
          },
          order: [["recid", "DESC"]],
        },
        { page: page || 0, pageSize: pageSize || "10" }
      )
    );

    res.status(200).json(posfileHead);
  });

  // router.get("/headRefund", async (req, res) => {
  //   // const {page, pageSize} = req.query;

  //   const posfileItems = await pos.findAll({
  //     where: {
  //       ordocnum: { [Op.ne]: "" },
  //       postrntyp: "ITEM",
  //       voidreason: null,
  //       trndte: dateTodayFormatter(),
  //     },
  //     attributes: ["ordercde", "ordocnum", "refnum", "extprc", "scharge", "scharge_disc", "refund"],
  //   });

  //   // Group by ordercde
  //   const groupedItems = posfileItems.reduce((acc, item) => {
  //     const key = item.ordercde;
  //     acc[key] = acc[key] || [];
  //     acc[key].push(item);
  //     return acc;
  //   }, {});

  //   const totals = [];

  //   for (const [ordercde, items] of Object.entries(groupedItems)) {
  //     let total = 0;
  //     let ordocnum = null;
  //     let refnum = null;

  //     for (const item of items) {
  //       const isRefunded = item.refund * 1 === 1;
  //       const netAmount = item.extprc * 1 + item.scharge * 1 - item.scharge_disc * 1;

  //       if (!isRefunded) {
  //         total += netAmount;
  //         // Capture ordocnum and refnum for non-refunded items
  //         if (!ordocnum && !refnum) {
  //           ordocnum = item.ordocnum;
  //           refnum = item.refnum;
  //         }
  //       } else {
  //         total -= netAmount;
  //       }
  //     }

  //     // Skip if total is approximately 0
  //     if (Math.round(total * 100) / 100 !== 0) {
  //       totals.push({
  //         ordercde,
  //         ordocnum,
  //         refnum,
  //         extprc: total,
  //       });
  //     }
  //   }

  //   res.status(200).json(totals);
  // });

  router.get("/headRefund", async (req, res) => {
    const { page, pageSize } = req.query;

    const posfileTOTALItems = await pos.findAll(
      paginate(
        {
          where: {
            postrntyp: "TOTAL",
            voidreason: null,
            trndte: {
              [Op.lte]: dateTodayFormatter(),
            },
            // do not include free transactions
            [Op.not]: [
              {
                ordercde: {
                  [Op.in]: literal(
                    `(SELECT ordercde FROM posfile WHERE freereason IS NOT NULL AND trndte <= '${dateTodayFormatter()}')`
                  ),
                },
              },
            ],
          },
          attributes: [
            "ordercde",
            "ordocnum",
            "refnum",
            "extprc",
            "scharge",
            "scharge_disc",
            "refund",
            "void",
            "trndte",
          ],
          order: [
            ["trndte", "DESC"],
            ["recid", "DESC"],
          ],
          raw: true,
        },
        { page: page || 0, pageSize: pageSize || "10" }
      )
    );

    // separate refunded and not refunded transactions
    const NA_TOTALItems = posfileTOTALItems.filter(
      (item) => item.refund * 1 === 1 || item.void * 1 === 1
    );
    const availableTOTALItems = posfileTOTALItems.filter(
      (item) => item.refund * 1 === 0 && item.void * 1 === 0
    );

    const totals = [];
    availableTOTALItems.forEach((item) => {
      const foundNA_TOTALItem = NA_TOTALItems.filter(
        (NA_item) => NA_item.ordercde === item.ordercde
      ).reduce((acc, NA_item) => acc + NA_item.extprc * 1, 0);

      const netDeductedNA_itemAmount =
        item.extprc * 1 - (foundNA_TOTALItem ? foundNA_TOTALItem : 0);
      if (netDeductedNA_itemAmount === 0) {
        return;
      }

      const netAmount =
        netDeductedNA_itemAmount + item.scharge * 1 - item.scharge_disc * 1;

      totals.push({
        ordercde: item.ordercde,
        ordocnum: item.ordocnum,
        refnum: item.refnum,
        extprc: netAmount,
        trndte: item.trndte,
      });
    });

    res.status(200).json(totals);
  });

  router.get("/void", async (req, res) => {
    const { page, pageSize } = req.query;

    const posfileHead = await pos.findAll(
      paginate(
        {
          where: { postrntyp: "TOTAL", void: 1, trndte: dateTodayFormatter() },
        },
        { page: page || 0, pageSize: pageSize || "10" }
      )
    );

    res.status(200).json(posfileHead);
  });

  router.get("/getAllPosVoid/:ordercde", async (req, res) => {
    // const voidLessVatAdj = await pos.findOne({
    //   where: {postrntyp: "Less Vat Adj.", ordercde: req.params.ordercde},
    // });
    const voidPayment = await pos.findAll({
      where: { postrntyp: "PAYMENT", ordercde: req.params.ordercde },
    });
    const voidChange = await pos.findOne({
      where: { postrntyp: "CHANGE", ordercde: req.params.ordercde },
    });
    const voidSCharge = await pos.findOne({
      where: { postrntyp: "SERVICE CHARGE", ordercde: req.params.ordercde },
    });
    let voidPosfiles = await pos.findAll({
      where: {
        postrntyp: "ITEM",
        ordercde: req.params.ordercde,
      },
    });
    const voidTotal = await pos.findOne({
      where: {
        postrntyp: "TOTAL",
        ordercde: req.params.ordercde,
      },
    });

    voidPosfiles = await Promise.all(
      voidPosfiles.map(async (item) => {
        const findItemDisc = await pos.findAll({
          where: {
            ordercde: req.params.ordercde,
            orderitmid: item.orderitmid,
            postrntyp: "DISCOUNT",
            refund: 0,
          },
          attributes: ["itmcde", "cardholder", "cardno", "tin"],
        });
        item.dataValues.posDiscount = findItemDisc;

        return item;
      })
    );

    res.status(200).json({
      voidChange,
      voidPayment,
      voidSCharge,
      voidPosfiles,
      voidTotal,
    });
  });

  router.get("/refundTransactions", async (req, res) => {
    const { page, pageSize } = req.query;

    const posfileHead = await pos.findAll(
      paginate(
        {
          where: {
            postrntyp: "TOTAL",
            refund: 1,
            trndte: dateTodayFormatter(),
          },
        },
        { page: page || 0, pageSize: pageSize || "10" }
      )
    );

    res.status(200).json(posfileHead);
  });

  router.get("/closedTransactions", async (req, res) => {
    const { page, pageSize } = req.query;

    let reprintTran = await pos.findAll(
      paginate(
        {
          where: {
            postrntyp: "TOTAL",
            void: 0,
            refund: 0,
            trndte: {
              [Op.between]: [req.query.from, req.query.to],
            },
            trnstat: 1,
          },
          order: [["recid", "DESC"]],
        },
        { page: page || 0, pageSize: pageSize || "10" }
      )
    );

    let tranItems = await pos.findAll({
      where: {
        postrntyp: "ITEM",
        ordocnum: {
          [Op.in]: reprintTran.map((tran) => tran.ordocnum),
        },
        refund: 0,
        trndte: {
          [Op.between]: [req.query.from, req.query.to],
        },
        // orderitmid: {
        //   [Op.notIn]: literal(`(SELECT orderitmid FROM posfile WHERE postrntyp = 'ITEM' AND refund = 1 AND trndte BETWEEN '${req.query.from}' AND '${req.query.to}')`),
        // },
      },
      group: ["ordocnum"],
      raw: true,
    });

    const refundedItems = await pos.findAll({
      where: {
        postrntyp: "ITEM",
        refund: 1,
        trndte: {
          [Op.between]: [req.query.from, req.query.to],
        },
      },
      raw: true,
    });

    tranItems = tranItems.filter((tran) => {
      const refundItems = refundedItems.filter(
        (item) => item.ordocnum === tran.ordocnum
      );
      const totalRefQty = refundItems.reduce(
        (acc, item) => acc + item.refundqty * 1,
        0
      );

      return tran.itmqty * 1 !== totalRefQty;
    });

    if (tranItems.length === 0) {
      reprintTran = [];
    } else {
      reprintTran = reprintTran.filter((tran) => {
        return tranItems.find((item) => item.ordocnum === tran.ordocnum);
      });
    }

    res.status(200).json(reprintTran);
  });

  router.get("/ordocnumItems/:ordocnum", async (req, res) => {
    const { ordocnum } = req.params;
    const itemfile = modelList.item.instance.GetInstance();

    const reprintTranItems = await pos.findAll({
      where: {
        ordocnum: ordocnum,
        postrntyp: "ITEM",
        "$itemfile.locationcde$": {
          [Op.or]: {
            [Op.ne]: null,
            [Op.ne]: "",
          },
        },
      },
      include: [
        {
          model: itemfile,
        },
      ],
    });

    res.status(200).json(reprintTranItems);
  });

  router.post("/void", async (req, res) => {
    const selectedFile = req.body;

    const currentSyspar = await syspar.findOne({});

    let voidnum = currentSyspar.voidnum;
    // const _vnum = parseInt(voidnum.split("-")[1]) + 1;
    // voidnum = voidnum.replace(/[^0a-zA-Z-]/g, _vnum);

    const voidnumNumericPart = voidnum.match(/\d+$/)[0];
    const incVoidNum = parseInt(voidnumNumericPart) + 1;
    // Convert the incremented value back to a string with leading zeros
    const incVoidNumStr = incVoidNum
      .toString()
      .padStart(voidnumNumericPart.length, "0");
    // Concatenate the non-numeric part with the incremented numeric part
    voidnum = voidnum.slice(0, -voidnumNumericPart.length) + incVoidNumStr;

    currentSyspar.voidnum = voidnum;
    currentSyspar.save();

    const updateAll = await pos.update(
      {
        void: selectedFile.void,
        voidreason: selectedFile.voidreason,
        voidnum: selectedFile.voidnum,
      },
      { where: { ordocnum: selectedFile.ordocnum } }
    );

    res.status(200).json(updateAll);
  });

  // const pos = models.posfile.instance.GetInstance();

  router.post("/payment", async (req, res) => {
    const findHeader = await header.findOne({});

    const returnObj = {
      ...req.body,
      warcde: findHeader.warcde,
      postrmno: findHeader.postrmno,
    };
    const posCreate = await posfileordering.GetInstance().create(returnObj);

    res.status(200).json(posCreate);
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
      const openTran = await transaction.findOne({
        where: {
          status: {
            [Op.or]: ["RECALL", "OPEN"],
          },
        },
        order: [["status", "DESC"]],
      });

      const deleted = await posfileordering.Delete({ recid: id });

      // check if no item already exists
      const posItems = await posfileordering.GetInstance().count({
        where: {
          ordercde: openTran.ordercde,
          postrntyp: "ITEM",
        },
      });

      // Done check if no item

      if (posItems === 0) {
        // remove all transactions by ordercde
        await posfileordering.GetInstance().destroy({
          where: {
            ordercde: openTran.ordercde,
          },
        });
        return res.status(200).json(deleted);
      }

      // Done removing all transactions including the initializied

      await computeTotal(posfileordering.GetInstance(), {
        postrntyp: "ITEM",
        ordercde: openTran.ordercde,
        // itmcomtyp: null,
      });

      if (deleted && deleted.chkcombo === 1) {
        const newFind = await posfileordering.GetInstance().findAll({
          where: {
            ordercde: openTran.ordercde,
            postrntyp: "ITEM",
            orderitmid: deleted.orderitmid,
          },
        });

        await Promise.all(
          newFind.map(async (item) => {
            await posfileordering.Delete({ recid: item.recid });
          })
        );

        try {
          await computeTotal(posfileordering.GetInstance(), {
            postrntyp: "ITEM",
            ordercde: openTran.ordercde,
          });
        } catch (e) {
          console.error(e);
        }
      }
      // delete addons
      await posfileordering.GetInstance().destroy({
        where: {
          mainitmid: deleted.orderitmid,
        },
      });

      res.status(200).json(deleted);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false });
    }
  });

  router.get("/hascashfund", async (req, res) => {
    const pos = posfile.GetInstance();

    const findCashFund = await pos.findOne({
      where: { postrntyp: "CASHFUND", batchnum: "" },
    });

    res.status(200).json(findCashFund);
  });

  router.post("/endTransaction", async (req, res) => {
    // const {ordercde, ordocnum} = req.body;
    const { ordercde } = req.body;
    const sysparInst = models.systemparameters.instance;
    const foundSyspar = await syspar.findOne({ attributes: ["ordocnum"] });

    let updatedObject = await posfileordering.GetInstance().update(
      { ordocnum: foundSyspar.ordocnum, trnstat: 1 },
      {
        where: {
          ordercde: ordercde,
        },
      }
    );

    await sysparInst.UpdateId("ordocnum");

    // save the data from posorderingfile table to posfile table every end of transaction
    const posorderingdata = await posfileordering.ReadMany({
      where: { ordercde },
      raw: true,
    });
    await posfile.BulkCreate(
      posorderingdata.rows.map((a) => {
        const copyA = { ...a };
        delete copyA.recid;
        return copyA;
      })
    );

    res.status(200).json(updatedObject);
  });

  // router.post("/refund", async (req, res) => {
  //   const findSyspar = await syspar.findOne({});

  //   findTotal = await pos.findOne({
  //     where: {postrntyp: "PAYMENT", ordercde: ordercde},
  //   });

  //   res.status(200).json(findTotal);
  // });

  router.get("/change/:ordercde", async (req, res) => {
    const { ordercde } = req.params;

    const findTotal = await pos.findOne({
      where: { postrntyp: "CHANGE", ordercde: ordercde },
    });

    res.status(200).json(findTotal);
  });

  router.post("/refund", async (req, res) => {
    const findSyspar = await syspar.findOne({});
    const dateNow = new Date();
    const timeNow = new Date().toLocaleTimeString();

    const { refundObj, modeOfRefund, supportingDetails } = req.body;

    const filterRefundObj = refundObj.map((d) => {
      const { recid, ...rest } = d;
      return {
        ...rest,
        trndte: dateNow,
        logtim: timeNow,
        refnum: findSyspar.refnum,
      };
    });

    const groupRefundObj = filterRefundObj.reduce((result, currentItem) => {
      const key = currentItem.ordocnum;
      (result[key] || (result[key] = [])).push(currentItem);
      return result;
    }, {});

    let total = [];

    await posfile.UpdateId("posdocnum");
    for (const [, refGroup] of Object.entries(groupRefundObj)) {
      const copyRefGroup = refGroup.map((item) => {
        const copy = { ...item };
        copy.docnum = findSyspar.posdocnum;
        return copy;
      });

      // copyRefGroup.docnum = findSyspar.posdocnum;
      const templateObject = {
        ordercde: refGroup[0].ordercde,
        ordocnum: refGroup[0].ordocnum,
        brhcde: refGroup[0].brhcde ?? "",
        itmcde: "",
        refund: 1,
        trnstat: 1,
        itmqty: 1,
        voidqty: 0,
        grossprc: 0,
        groprc: 0,
        untprc: 0,
        vatrte: 0,
        ordertyp: refGroup[0].ordertyp,
        memc: refGroup[0].memc,
        memc_value: refGroup[0].memc_value,
        taxcde: null,
        itmpaxcount: refGroup[0].itmpaxcount,
        isaddon: false,
        mainitmcde: refGroup[0].itmcde,
        postypcde: refGroup[0].postypcde,
        warcde: refGroup[0].warcde,
        docnum: findSyspar.posdocnum,
        billdocnum: refGroup[0].billdocnum,
        // trndte: refGroup[0].trndte,
        // logtim: refGroup[0].logtim,
        trndte: dateNow,
        logtim: timeNow,
        cashier: refGroup[0].cashier || "sampleUser",
        numpax: 1,
        postrmno: refGroup[0].postrmno,
        bnkcde: refGroup[0].bnkcde,
        itmnum: refGroup[0].itmnum,
        trncde: "POS",
      };

      const discountOfItem = await pos.findAll({
        where: {
          ordocnum: refGroup[0].ordocnum,
          postrntyp: "DISCOUNT",
          orderitmid: {
            [Op.in]: refGroup.map((item) => item.orderitmid),
          },
        },
      });

      total.push([
        ...copyRefGroup,
        ...discountOfItem.map((item) => {
          const disc = item.dataValues;

          const refundItem = refGroup.find(
            (a) => a.orderitmid === disc.orderitmid
          );
          disc.amtdis =
            (disc.amtdis / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.disamt =
            (disc.disamt / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.groext =
            (disc.groext / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.extprc =
            (disc.extprc / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.groprc =
            (disc.groprc / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.netvatamt =
            (disc.netvatamt / refundItem.itmqty2) * (refundItem.refundqty * 1); // refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.scharge =
            (disc.scharge / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.lessvat =
            (disc.lessvat / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.vatexempt =
            (disc.vatexempt / refundItem.itmqty2) * (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.scharge_disc =
            (disc.scharge_disc / refundItem.itmqty2) *
            (refundItem.refundqty * 1); //refundItem.itmqty2*1 - (refundItem.refundqty*1 - 1);
          disc.refund = 1;
          disc.trnstat = 1;
          disc.refnum = findSyspar.refnum;
          disc.ordocnum = refGroup[0].ordocnum;
          disc.ordercde = refGroup[0].ordercde;
          disc.refundreason = refGroup[0].refundreason;
          // disc.refundlogtim = refGroup[0].refundlogtim;
          // disc.refunddte = refGroup[0].refunddte;
          disc.refundlogtim = timeNow;
          disc.refunddte = dateNow;
          delete disc.recid;
          return disc;
        }),
        {
          ...templateObject,
          itmcde: "TOTAL",
          postrntyp: "TOTAL",
          // trndte: dateTodayFormatter(),
          // logtim: timeTodayFormatter(),
          trndte: dateNow,
          logtim: timeNow,
          refnum: findSyspar.refnum,
          ordocnum: refGroup[0].ordocnum,
          ordercde: refGroup[0].ordercde,
          ordertyp: refGroup[0].ordertyp,
          brhcde: refGroup[0].brhcde,
          refund: 1,
          trnstat: 1,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
          taxcde: refGroup[0].taxcde,
          cashier: refGroup[0].cashier,
          groext: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.groext),
            0
          ),
          amtdis: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.amtdis),
            0
          ),
          lessvat: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.lessvat),
            0
          ),
          vatexempt: refGroup.reduce((total, currentItem) => {
            const vatExemptValue = parseFloat(currentItem.vatexempt);
            if (isNaN(vatExemptValue)) return total + 0;

            return total + parseFloat(vatExemptValue);
          }, 0),
          vatamt: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.vatamt),
            0
          ),
          netvatamt: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.netvatamt),
            0
          ),
          extprc: refGroup.reduce(
            (total, currentItem) =>
              total +
              parseFloat(currentItem.extprc) +
              parseFloat(currentItem.scharge) -
              parseFloat(currentItem.scharge_disc),
            0
          ),
          // vatamt: refGroup.reduce(
          //   (total, currentItem) => total + parseFloat(currentItem.vatamt),
          //   0
          // ),
          // vatamt: refGroup.reduce(
          //   (total, currentItem) => total + parseFloat(currentItem.vatamt),
          //   0
          // ),
        },
        {
          ...(supportingDetails && { ...supportingDetails }),
          ...templateObject,
          cashier: refGroup[0].cashier,
          itmcde: modeOfRefund,
          postrntyp: "PAYMENT",
          // trndte: dateTodayFormatter(),
          // logtim: timeTodayFormatter(),
          trndte: dateNow,
          logtim: timeNow,
          refnum: findSyspar.refnum,
          ordocnum: refGroup[0].ordocnum,
          ordercde: refGroup[0].ordercde,
          ordertyp: refGroup[0].ordertyp,
          brhcde: refGroup[0].brhcde,
          refund: 1,
          trnstat: 1,
          refundreason: refGroup[0].refundreason,
          refundlogtim: timeNow,
          refunddte: dateNow,
          taxcde: refGroup[0].taxcde,
          groext: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.groext),
            0
          ),
          amtdis: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.amtdis),
            0
          ),
          lessvat: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.lessvat),
            0
          ),
          vatexempt: refGroup.reduce((total, currentItem) => {
            const vatExemptValue = parseFloat(currentItem.vatexempt);
            if (isNaN(vatExemptValue)) return total + 0;

            return total + parseFloat(vatExemptValue);
          }, 0),
          vatamt: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.vatamt),
            0
          ),
          netvatamt: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.netvatamt),
            0
          ),
          extprc: refGroup.reduce(
            (total, currentItem) =>
              total +
              parseFloat(currentItem.extprc) +
              parseFloat(currentItem.scharge) -
              parseFloat(currentItem.scharge_disc),
            0
          ),
          // vatamt: refGroup.reduce(
          //   (total, currentItem) => total + parseFloat(currentItem.vatamt),
          //   0
          // ),
          // vatamt: refGroup.reduce(
          //   (total, currentItem) => total + parseFloat(currentItem.vatamt),
          //   0
          // ),
        },
        {
          ...templateObject,
          itmcde: "SERVICE CHARGE",
          postrntyp: "SERVICE CHARGE",
          itmqty: 1,
          refnum: findSyspar.refnum,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
          extprc: refGroup.reduce((total, currentItem) => {
            return total + parseFloat(currentItem.scharge);
          }, 0),
          amtdis: refGroup.reduce(
            (total, currentItem) =>
              total + parseFloat(currentItem.scharge_disc),
            0
          ),
        },
        {
          ...templateObject,
          itmcde: "VATEXEMPT",
          postrntyp: "VATEXEMPT",
          itmqty: 1,
          refnum: findSyspar.refnum,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
          extprc: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.vatexempt),
            0
          ),
        },
        {
          ...templateObject,
          itmcde: "LOCALTAX",
          postrntyp: "LOCALTAX",
          itmqty: 1,
          refnum: findSyspar.refnum,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
        },
        {
          ...templateObject,
          itmcde: "VAT 0 RATED",
          postrntyp: "VAT 0 RATED",
          itmqty: 1,
          refnum: findSyspar.refnum,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
        },
        {
          ...templateObject,
          itmcde: "DISCOUNTABLE",
          postrntyp: "DISCOUNTABLE",
          itmqty: 1,
          refnum: findSyspar.refnum,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
          extprc: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.vatexempt),
            0
          ),
        },
        {
          ...templateObject,
          itmcde: "Less Vat Adj.",
          postrntyp: "Less Vat Adj.",
          itmqty: 1,
          refnum: findSyspar.refnum,
          refundreason: refGroup[0].refundreason,
          // refundlogtim: refGroup[0].refundlogtim,
          // refunddte: refGroup[0].refunddte,
          refundlogtim: timeNow,
          refunddte: dateNow,
          extprc: refGroup.reduce(
            (total, currentItem) => total + parseFloat(currentItem.lessvat),
            0
          ),
        },
      ]);
    }

    await Promise.all(total.map((subArr) => pos.bulkCreate(subArr)));

    const findRefund = await pos.findOne({
      where: {
        postrntyp: "PAYMENT",
        ordercde: refundObj[0].ordercde,
        refund: 1,
      },
    });

    await posfile.UpdateId("refnum");
    res.status(200).json({ status: true, findRefund });
  });

  router.get("/refund/total", async (req, res) => {
    const findRefundTotal = await pos.findAll({
      where: { postrntyp: "TOTAL", refnum: { [Op.not]: null } },
    });

    res.status(200).json(findRefundTotal);
  });

  router.get(`/previousRefundedPayment/:ordercde`, async (req, res) => {
    const { ordercde } = req.params;

    const findTotal = await pos.findOne({
      where: {
        postrntyp: "PAYMENT",
        batchnum: "",
        ordercde: ordercde,
        refund: 1,
      },
    });

    res.status(200).json(findTotal);
  });

  router.get("/prevTransactionPayments/:ordercde", async (req, res) => {
    const { ordercde } = req.params;

    const findTotal = await pos.findOne({
      where: {
        postrntyp: "PAYMENT",
        batchnum: "",
        ordercde: ordercde,
        refund: 0,
        void: 0,
      },
    });

    res.status(200).json(findTotal);
  });

  router.get("/refund/items/:refnum", async (req, res) => {
    const { refnum } = req.params;

    const findRefundTotal = await pos.findAll({
      where: { postrntyp: "ITEM", refnum: refnum },
    });

    res.status(200).json(findRefundTotal);
  });

  router.get("/no_eod/:cashier", async (req, res) => {
    const nowDate = new Date();
    // get the latest transaction by trndte
    const pos = posfile.GetInstance();
    const now = format(nowDate, "yyyy-MM-dd");

    if (req.params.cashier === "None") {
      res.status(404).json({ err: "Cashier not found" });
      return;
    }

    const latestTransaction = await pos.findOne({
      where: {
        trndte: {
          [Op.ne]: now,
        },
      },
      order: [["trndte", "DESC"]],
      attributes: ["trndte"],
    });

    if (!latestTransaction) {
      return res.status(200).json({ NOEOD: false });
    }

    const latesTranDate = new Date(latestTransaction.trndte);
    const gapMos = nowDate.getMonth() - latesTranDate.getMonth();
    let gapDays = -1;

    if (gapMos > 0) {
      let date = new Date();
      let lastDayOfMonth = new Date(
        new Date(date.getFullYear(), date.getMonth(), 1) - 1
      );

      const lastMonthGapDays =
        lastDayOfMonth.getDate() - latesTranDate.getDate();
      gapDays = lastMonthGapDays + nowDate.getDate();
    } else {
      gapDays = nowDate.getDate() - latesTranDate.getDate();
    }

    console.log("Gap dayssss ugh", gapDays);

    if (gapDays > 1) {
      latesTranDate.setDate(latesTranDate.getDate() + 1);
      nowDate.setDate(nowDate.getDate() - 1);
      res.status(200).json({
        NOEOD: true,
        from: format(latesTranDate, "yyyy-MM-dd"),
        to: format(nowDate, "yyyy-MM-dd"),
      });
      return;
    }

    res.status(200).json({ NOEOD: false });
  });

  router.get("/refund/list", async (req, res) => {
    const findAll = await pos.findAll({
      where: {
        refnum: { [Op.not]: null },
        postrntyp: "ITEM",
      },
    });

    res.status(200).json(findAll);
  });

  router.get("/previousAll", async (req, res) => {
    const { ordocnum } = req.query;

    try {
      const findPreviousAll = await getAllPrevious(ordocnum);

      res.status(200).json(findPreviousAll);
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e });
    }
  });

  router.get("/getAllCashfunds", async (req, res) => {
    try {
      const found = await pos.findAll({
        where: {
          postrntyp: "CASHFUND",
          trndte: dateTodayFormatter(),
        },
      });

      res.status(200).json(found);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  });

  router.get("/getAllCashins", async (req, res) => {
    try {
      const found = await pos.findAll({
        where: {
          postrntyp: "CASHIN",
          trndte: dateTodayFormatter(),
        },
      });

      res.status(200).json(found);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  });

  router.get("/getAllCashouts", async (req, res) => {
    try {
      const found = await pos.findAll({
        where: {
          postrntyp: "CASHOUT",
          trndte: dateTodayFormatter(),
        },
      });

      res.status(200).json(found);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  });

  router.get("/getAllCashDeclarations", async (req, res) => {
    try {
      const found = await pos.findAll({
        where: {
          postrntyp: "DECLARATION",
          trndte: dateTodayFormatter(),
        },
      });

      res.status(200).json(found);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  });

  router.post("/fixDuplicate", async (req, res) => {
    const { from, to } = req.query;
    const pos = posfile.GetInstance();

    // get all transactions
    const postrntyps = [
      "TOTAL",
      "SERVICE CHARGE",
      "VATEXEMPT",
      "LOCALTAX",
      "VAT 0 RATED",
      "DISCOUNTABLE",
      "Less Vat Adj.",
    ];

    const foundPos = await pos.findAll({
      where: {
        trndte: {
          [Op.between]: [from, to],
        },
        postrntyp: {
          [Op.in]: postrntyps,
        },
        refund: 0,
      },
      order: ["recid", "ordercde"],
      raw: true,
    });

    // reduce by ordercde and postrntyp
    const reducedPos = foundPos.reduce((acc, current) => {
      const key = current.ordercde;
      const exist = (acc[key] || (acc[key] = {}))[current.postrntyp];
      if (exist) {
        exist.push(current);
      } else {
        acc[key][current.postrntyp] = [current];
      }
      return acc;
    }, {});

    // console.log('reducedPos', reducedPos);

    const deletedItems = [];
    for (const [_, posObj] of Object.entries(reducedPos)) {
      let hasDuplicate = false;
      for (const [_, pos] of Object.entries(posObj)) {
        if (pos.length > 1) {
          hasDuplicate = true;
          const toRemove = pos.slice(1);

          await Promise.all(
            toRemove.map(async (item) => {
              // deletedItems.push({recid: item.recid, ordercde: item.ordercde, postrntyp: item.postrntyp});
              deletedItems.push(item.recid);
            })
          );
        }
      }
    }

    if (deletedItems.length === 0) {
      return res.status(200).json(undefined);
    }

    // delete all items with only one query
    await posfile.GetInstance().destroy({
      where: {
        recid: {
          [Op.in]: deletedItems,
        },
      },
    });

    console.log("---- RECOMPUTING TOTALS... PLEASE WAIT ----");
    console.log("---- DO NOT TOUCH ANYTHING NOR CLOSE THE PROGRAM !!! ----");

    for (const ordercde of Object.keys(reducedPos)) {
      await recomputeTotalByOrdercde({
        postrntyp: "ITEM",
        ordercde: ordercde,
      });
    }

    console.log("---- RECOMPUTING TOTALS SUCCESSFULLY !!! ----");

    res.status(200).json(deletedItems);
  });

  // Use to count the reprinted OR/INV
  router.post("/reprintCount", async (req, res) => {
    const { ordercde } = req.body;

    try {
      const pos = posfile.GetInstance();

      const findTotal = await pos.findOne({
        where: {
          postrntyp: "TOTAL",
          ordercde: ordercde,
        },
      });

      findTotal.reprinted = ++findTotal.reprinted;
      findTotal.reprinted_amt = findTotal.groext * findTotal.reprinted;
      findTotal.save();

      res.status(200).json({ status: true });
    } catch (error) {
      console.error(error);
    }
  });

  router.get("/validatePosfile", async (req, res) => {
    try {
      // try to remove the duplicated 'NO ORDOCNUM' before validating
      await fixNoOrdocnum(posfileordering, posfile);

      const posorderingdata = await posfileordering.ReadMany({
        attributes: ["itmcde", "postrntyp", "ordocnum", "trndte"],
        raw: true,
      });

      const posfiledata = await posfile.ReadMany({
        where: {
          trndte: posorderingdata.rows[0]?.trndte || '',
        },
        raw: true,
      });

      if (posorderingdata.count === 0 && posfiledata.count === 0) {
        console.error("Nothing to compare");
        return res.status(200).json({ status: "failed" });
      }

      // compare the two table
      const posOrderingDataValidateResult = posorderingdata.rows
        .filter((a) => a.postrntyp === "ITEM")
        .reduce(
          (acc, posordering) => {
            const ordocnum = posordering.ordocnum;
            const itmcde = posordering.itmcde;

            const found = posfiledata.rows.find(
              (a) => a.ordocnum === ordocnum && a.itmcde === itmcde
            );

            if (found) {
              return acc;
            } else {
              acc.hasDiscrepancy = true;
              acc.list.push({ ordocnum, itmcde });
              return acc;
            }
          },
          { hasDiscrepancy: false, table: "posorderingfile", list: [] }
        );

      const posfileDataValidateResult = posfiledata.rows
        .filter((a) => a.postrntyp === "ITEM")
        .reduce(
          (acc, posordering) => {
            const ordocnum = posordering.ordocnum;
            const itmcde = posordering.itmcde;

            const found = posorderingdata.rows.find(
              (a) => a.ordocnum === ordocnum && a.itmcde === itmcde
            );

            if (found) {
              return acc;
            } else {
              acc.hasDiscrepancy = true;
              acc.list.push({ ordocnum, itmcde });
              return acc;
            }
          },
          { hasDiscrepancy: false, table: "posfile", list: [] }
        );

      const dscprncy = [];
      if (posOrderingDataValidateResult.hasDiscrepancy) {
        const posfileDiscrpncy = {
          table: posOrderingDataValidateResult.table,
          list: posOrderingDataValidateResult.list,
        };
        dscprncy.push(posfileDiscrpncy);
        console.log("LIST OF DISCREPANCIES:", posfileDiscrpncy);
      } else if (posfileDataValidateResult.hasDiscrepancy) {
        const posOrderingDiscrpncy = {
          table: posfileDataValidateResult.table,
          list: posfileDataValidateResult.list,
        };
        dscprncy.push(posOrderingDiscrpncy);
        console.log("LIST OF DISCREPANCIES:", posOrderingDiscrpncy);
      }
      fs.writeFileSync("sales_discrepancies.log", JSON.stringify(dscprncy));

      // if there's no discrepancy then clean the posorderingfile table
      if (dscprncy.length === 0)
        await posfileordering.GetInstance().destroy({ where: {} });

      res.status(200).json({
        status: "success",
        data: [posOrderingDataValidateResult, posfileDataValidateResult],
      });
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

  return router;
};
