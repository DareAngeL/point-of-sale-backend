
const { format } = require("date-fns");
const {
  LNextsCentral,
  NewTrnCode,
  convertToAccounting_new_v2,
  _log,
} = require("../helper/index");
const path = require("path");
const { fs } = require("file-system");
const archiver = require("archiver");
!archiver.isRegisteredFormat("zip-encryptable") &&
  archiver.registerFormat(
    "zip-encryptable",
    require("archiver-zip-encryptable")
  );
const { Op, fn, col, literal } = require("sequelize");
const { modelList } = require("../model/model");
const { sendMsg } = require("../socket");

const specialrequestdetail = modelList.specialrequestdetail.instance.GetInstance();
const itemfile = modelList.item.instance.GetInstance();

const generateTransferFile = async (posfile, xarr_req, comcde, sendSocketMsg, cb) => {
  
  const posfileInstance = posfile.GetInstance();
  let xarr_docnum = xarr_req;

  sendSocketMsg && sendMsg('Generating transactions data: 0%');

  const headerfile = await modelList.headerfile.instance
    .GetInstance()
    .findOne({ raw: true });

  //#region POSFILE query
  let xarr_posfile = await posfileInstance
    .findAll({
      where: { docnum: { [Op.in]: xarr_docnum } },
      // include: [{model: specialrequestdetail}],
    });
  //#endregion

  const branchCode = headerfile.brhcde;
  const terminalNumber = headerfile.postrmno;

  if (xarr_posfile.length > 0) {
    let xarr_ordercde = xarr_posfile.map(d => d.ordercde) //[];
    const orderitmids = xarr_posfile.map(d => d.orderitmid).filter(d => d !== null);
    //#region POSFILE
    xarr_posfile = xarr_posfile.map((value) => {
      const newValue = {...value.dataValues};
      
      if (newValue.ordercde !== null) {
        newValue.ordercde = NewTrnCode(
          newValue.ordercde,
          newValue.brhcde,
          Number(newValue.postrmno)
        );
      }

      newValue.trnsfrdte = format(new Date(), "yyyy-MM-dd");

      if (newValue.billdocnum !== null) {
        newValue.billdocnum = NewTrnCode(
          newValue.billdocnum,
          newValue.brhcde,
          Number(newValue.postrmno)
        );
      }

      // newValue['orderitemmodifierfile'] = [];
      return newValue;
    });

    sendSocketMsg && sendMsg('Generating transactions data: 10%');
    //#endregion

    //#region ORDERITEMMODIFIERFILE
    const orderitemmodifierfiles = await specialrequestdetail.findAll({
      where: { ordercde: { [Op.in]: orderitmids } },
    });
    //#endregion

    //#region ORDERITEMDISCOUNTFILE
    const xarr_orderitemdiscountfile =
      await modelList.orderitemdiscount.instance.GetInstance().findAll({
        where: { ordercde: { [Op.in]: xarr_ordercde } },
        raw: true,
      });

    xarr_orderitemdiscountfile.map((ordervalue) => {
      ordervalue.ordercde = NewTrnCode(
        ordervalue.ordercde,
        branchCode,
        Number(terminalNumber)
      );
    });

    sendSocketMsg && sendMsg('Generating transactions data: 20%');
    //#endregion

    let xsaldocnum = "TMP-0000001";
    let xsrtdocnum = "TMP-0000001";
    let salesfile1_arr = [],
      salesfile2_arr = [],
      salesreturnfile1_arr = [],
      salesreturnfile2_arr = [];

    //#region process sales
    const arrayOrder = await posfile
      .GetInstance()
      .findAll({
        where: {
          docnum: { [Op.in]: xarr_docnum },
          itmcde: "TOTAL",
          void: 0,
          refund: 0,
        },
        attributes: ["ordocnum"],
        raw: true,
      });

    for (const data of arrayOrder) {
      const ordocnum = data.ordocnum;

      //#region SALESFILE1
      const trntot = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [[fn("SUM", col("extprc")), "extprc"]],
            raw: true,
          })
        ).extprc
      );

      const groext = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [[fn("SUM", col("groext")), "groext"]],
            raw: true,
          })
        ).groext
      );

      const vatamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [[fn("SUM", col("vatamt")), "vatamt"]],
            raw: true,
          })
        ).vatamt
      );

      const acc_netvatamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "ITEM",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [[fn("SUM", col("netvatamt")), "netvatamt"]],
            raw: true,
          })
        ).netvatamt
      );

      const vatexemptamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "VATEXEMPT",
              postrntyp: "VATEXEMPT",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [[fn("SUM", col("extprc")), "extprc"]],
            raw: true,
          })
        ).extprc
      );

      const acc_vatableamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [[fn("SUM", col("netvatamt")), "netvatamt"]],
            raw: true,
          })
        ).netvatamt
      );

      const orderinfo = await posfileInstance
        .findOne({
          where: {
            docnum: { [Op.in]: xarr_docnum },
            itmcde: "TOTAL",
            postrntyp: "TOTAL",
            ordocnum: ordocnum,
            void: 0,
          },
          attributes: ["ordercde", "cashier", "trndte", "logtim"],
          raw: true,
        });

      const totalDiscount = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              postrntyp: "DISCOUNT",
              ordocnum: ordocnum,
              void: 0,
            },
            attributes: [
              [
                fn(
                  "sum",
                  literal("CASE WHEN extprc=0 THEN amtdis ELSE extprc END")
                ),
                "discount",
              ],
            ],
            raw: true,
          })
        ).discount
      );

      const xcuscde = "WALKIN";
      const xcusdsc = "WALKIN";
      const xcusadd1 = "";

      let salesfile1_data = {
        docnum: xsaldocnum,
        warcde: data.warcde,
        cusdsc: xcusdsc,
        trncde: "SAL",
        trntot: trntot,
        smncde: orderinfo && orderinfo.cashier,
        trmcde: "CASH",
        cuscde: xcuscde,
        curcde: "PHP",
        usrnam: orderinfo && orderinfo.cashier,
        currte: 1,
        vatamt: vatamt,
        textprc: trntot,
        trntotfor: trntot,
        textprcfor: trntot,
        docapp: `SAL-${xsaldocnum}`,
        docbal: 0,
        netvatamt: Number(acc_netvatamt).toFixed(2),
        docbalfor: 0,
        vatableamt: Number(acc_vatableamt).toFixed(2),
        vatexemptamt: vatexemptamt,
        vatamtfor: vatamt,
        netvatamtfor: Number(acc_netvatamt).toFixed(2),
        vatableamtfor: Number(acc_vatableamt).toFixed(2),
        vatexemptamtfor: vatexemptamt,
        totamtdis: -totalDiscount,
        totgroext: groext,
        totamtdisfor: -totalDiscount,
        totgroextfor: groext,
        netamt: trntot,
        netamtfor: trntot,
        logtim: orderinfo
          ? `${orderinfo.trndte} ${orderinfo.logtim}`
          : null,
        cusadd1: xcusadd1,
        manualewt: 0,
        doclock: "Y",
        trndte: orderinfo && orderinfo.trndte,
        duedate: orderinfo && orderinfo.trndte,
        logdte: orderinfo && orderinfo.trndte,
        brhcde: branchCode,
      };

      salesfile1_arr.push(salesfile1_data);
      //#endregion SALESFILE1

      sendSocketMsg && sendMsg('Generating transactions data: 30%');

      //#region SALESFILE2
      // This will get all the item in specific order number
      let arrayItems = await posfileInstance
        .findAll({
          where: {
            docnum: { [Op.in]: xarr_docnum },
            postrntyp: "ITEM",
            ordocnum: ordocnum,
            void: 0,
          },
          attributes: [
            "recid",
            "itmcde",
            "itmqty",
            "untprc",
            "extprc",
            "netvatamt",
            "vatamt",
            "taxcde",
            "vatrte",
            "groprc",
          ],
          raw: true,
        });

      let linenum_index = 1;

      for (const item of arrayItems) {
        const posfile_item = await posfile
          .GetInstance()
          .findOne({
            where: {
              recid: item.recid,
            },
            include: itemfile,
            raw: true,
          });

        const posfileDiscount = xarr_posfile.filter(
          (e) => e.postrntyp === "DISCOUNT" && e.ordocnum === ordocnum
        );

        //check if posfile_item = combo item
        if (!posfile_item.itmcomcde) {
          const iteminfo_arr = (
            await convertToAccounting_new_v2(posfile_item, posfileDiscount)
          ).iteminfo_arr;

          for (let iteminfo of iteminfo_arr) {
            const discountInfo =
              iteminfo.itemDiscInfo === undefined
                ? undefined
                : iteminfo.itemDiscInfo.length > 0
                ? iteminfo.itemDiscInfo[0]
                : undefined;

            let salesfile2_data = {
              linegrp: 0,
              chkasy: 0,
              copyline: 0,
              scpwddis: 0,
              scpwdamt: 0,
              scpwdamtfor: 0,
              docnum: xsaldocnum,
              cusdsc: xcusdsc,
              itmcde: iteminfo.itemCode,
              itmdsc: posfile_item["itemfile.itmdsc"],
              itmqty: iteminfo.itemQty,
              untprc: Number(iteminfo.itemUntPrc).toFixed(2),
              extprc: Number(iteminfo.itemExtprc).toFixed(2), // confirm
              trncde: "SAL",
              untmea: iteminfo.itemUntMea,
              prcdst1: 0,
              prcdst2: 0,
              prcdst3: 0,
              factor: -1,
              linenum: linenum_index,
              cuscde: `${xcuscde}`,
              warcde: posfile_item.warcde,
              groprc: Number(iteminfo.itemGroPrc).toFixed(2),
              prccde: "",
              sonum: "",
              disamt: 0,
              conver1: 0,
              smncde: orderinfo && orderinfo.cashier,
              usrnam: orderinfo && orderinfo.cashier,
              logtim: orderinfo
                ? `${orderinfo.trndte} ${orderinfo.logtim}`
                : null,
              curcde: "PHP",
              currte: 1,
              untprcfor: Number(iteminfo.itemUntPrc).toFixed(2),
              groprcfor: Number(iteminfo.itemGroPrc).toFixed(2),
              extprcfor: Number(iteminfo.itemExtprc).toFixed(2), // confirm
              disper:
                discountInfo || discountInfo !== undefined
                  ? discountInfo.disper
                  : 0,
              itmtyp: posfile_item["itemfile.itmtyp"],
              netvatamt: Number(iteminfo.itemNetVatAmt).toFixed(2),
              taxcde: iteminfo.itemTaxCde,
              vatamt: Number(iteminfo.itemVatAmt).toFixed(2), // confirm
              vatrte: iteminfo.itemVatRte,
              netvatamtfor: Number(iteminfo.itemNetVatAmt).toFixed(2), // confirm
              vatamtfor: Number(iteminfo.itemVatAmt).toFixed(2), // confirm
              amtdis: -Number(iteminfo.itemAmtDis).toFixed(2),
              groext: Number(iteminfo.itemGroExt).toFixed(2),
              amtdisfor: -Number(iteminfo.itemAmtDis).toFixed(2),
              groextfor: Number(iteminfo.itemGroExt).toFixed(2),
              dettyp: "I",
              trndte: orderinfo && orderinfo.trndte,
              logdte: orderinfo && orderinfo.trndte,
              barcodenum: iteminfo.itemBarcde,
              brhcde: branchCode,
              barcde: iteminfo.itemBarcde,
              disccde:
                discountInfo || discountInfo !== undefined
                  ? discountInfo.discde
                  : "",
              discper:
                discountInfo || discountInfo !== undefined
                  ? discountInfo.disper
                  : 0,
            };

            salesfile2_arr.push(salesfile2_data);
            linenum_index++;
          }
        }
      }

      //CREATE ITEM
      const scharge = await posfileInstance
        .findOne({
          where: {
            itmcde: "SERVICE CHARGE",
            postrntyp: "SERVICE CHARGE",
            brhcde: branchCode,
            ordocnum: ordocnum,
            void: 0,
          },
          attributes: ["extprc"],
          raw: true,
        });
      const xservice_charge = scharge && Number(scharge.extprc);

      const xarr_tmp_salesfile2 = salesfile2_arr.filter(
        (e) => e.docnum === xsaldocnum
      )[0];

      if (xservice_charge > 0) {
        var xxcusdsc = !xarr_tmp_salesfile2
          ? ""
          : xarr_tmp_salesfile2.cusdsc;
        // INSERT SERVICE CHARGE ON SALESFILE2
        let xarr_xsalesfile2_data = {
          linegrp: 0,
          chkasy: 0,
          copyline: 0,
          scpwddis: 0,
          scpwdamt: 0,
          scpwdamtfor: 0,
          docnum: xsaldocnum,
          cusdsc: xxcusdsc,
          itmcde: "SERVICECHARGE",
          itmdsc: "SERVICECHARGE",
          itmqty: 1,
          untprc: xservice_charge,
          extprc: xservice_charge, // confirm
          trncde: "SAL",
          untmea: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.untmea : "PCS",
          prcdst1: 0,
          prcdst2: 0,
          prcdst3: 0,
          factor: -1,
          linenum: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.linenum : "",
          cuscde: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.cuscde : "",
          warcde: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.warcde : "ALL",
          groprc: xservice_charge,
          prccde: "",
          sonum: "",
          disamt: 0,
          conver1: 0,
          smncde: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.smncde : "",
          usrnam: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.usrnam : "",
          logtim: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.logtim : "",
          curcde: "PHP",
          currte: 1,
          untprcfor: xservice_charge,
          groprcfor: xservice_charge,
          extprcfor: xservice_charge,
          disper: 0,
          itmtyp: "CHARGES",
          netvatamt: xservice_charge,
          taxcde: "VAT EXEMPT",
          vatamt: 0,
          vatrte: 0,
          netvatamtfor: xservice_charge,
          vatamtfor: 0,
          amtdis: 0,
          groext: xservice_charge,
          amtdisfor: 0,
          groextfor: xservice_charge,
          dettyp: "I",
          trndte: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.trndte : "",
          logdte: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.trndte : "",
          barcodenum: "",
          brhcde: xarr_tmp_salesfile2 ? xarr_tmp_salesfile2.brhcde : "",
          barcde: "",
          disccde: "",
          discper: 0,
        };
        salesfile2_arr.push(xarr_xsalesfile2_data);
      }
      //#endregion SALESFILE2
      
      sendSocketMsg && sendMsg('Generating transactions data: 40%');
      xsaldocnum = LNextsCentral(xsaldocnum, "SAL", 7);
    }

    //CHECK IF DUPLICATE OF SALESFILE1 AND SALESFILE2
    for (const xsales1 of salesfile1_arr) {
      // FOREACH SALES FILE 1
      const count = await modelList.sales.instance
        .GetInstance()
        .count({ where: { docnum: xsales1.docnum } });
      if (count > 0) {
        // IF DOCNUM ALREADY EXISTS IN SALESRETURN 1, DELETES THE DATA
        const destroy = await modelList.sales.instance
          .GetInstance()
          .destroy({
            where: { docnum: xsales1.docnum },
          });

        if (destroy) {
          const reSales = await modelList.sales.instance
            .GetInstance()
            .create(xsales1);
          if (reSales) {
            const xarr_salesfile2_filtered = salesfile2_arr.filter(
              (xdata) => xdata.docnum == xsales1.docnum
            );

            if (xarr_salesfile2_filtered.length > 0) {
              const count = await modelList.salesdetail.instance
                .GetInstance()
                .count({
                  where: {
                    docnum: xarr_salesfile2_filtered[0].docnum,
                  },
                });
              if (count > 0) {
                // IF DOCNUM ALREADY EXISTS IN SALESRETURNFILE 2, DELETES THE DATA
                const destroy = await modelList.salesdetail.instance
                  .GetInstance()
                  .destroy({
                    where: {
                      docnum: xarr_salesfile2_filtered[0].docnum,
                    },
                  });
                if (destroy) {
                  // ADD SALESRETURNFILE2
                  await modelList.salesdetail.instance
                    .GetInstance()
                    .bulkCreate(xarr_salesfile2_filtered);
                }
              }
            }
          }
        }
      }
    }

    sendSocketMsg && sendMsg('Generating transactions data: 50%');
    //#endregion

    //#region process sales return
    const arraySalesReturn = await posfile
      .GetInstance()
      .findAll({
        where: { docnum: { [Op.in]: xarr_docnum }, refund: 1 },
        raw: true,
      });

    for (const data of arraySalesReturn) {
      const ordocnum = data.ordocnum;

      //#region SALESRETURNFILE1
      const trntot = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [[fn("SUM", col("extprc")), "extprc"]],
            raw: true,
          })
        ).extprc
      );

      const groext = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [[fn("SUM", col("groext")), "groext"]],
            raw: true,
          })
        ).groext
      );

      const vatamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [[fn("SUM", col("vatamt")), "vatamt"]],
            raw: true,
          })
        ).vatamt
      );

      const acc_netvatamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "ITEM",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [[fn("SUM", col("netvatamt")), "netvatamt"]],
            raw: true,
          })
        ).netvatamt
      );

      const vatexemptamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "VATEXEMPT",
              postrntyp: "VATEXEMPT",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [[fn("SUM", col("extprc")), "extprc"]],
            raw: true,
          })
        ).extprc
      );

      const acc_vatableamt = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              itmcde: "TOTAL",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [[fn("SUM", col("netvatamt")), "netvatamt"]],
            raw: true,
          })
        ).netvatamt
      );

      const orderinfo = await posfileInstance
        .findOne({
          where: {
            docnum: { [Op.in]: xarr_docnum },
            itmcde: "TOTAL",
            postrntyp: "TOTAL",
            ordocnum: ordocnum,
            refund: 1,
          },
          attributes: ["ordercde", "cashier", "trndte", "logtim"],
          raw: true,
        });

      const totalDiscount = Number(
        (
          await posfileInstance.findOne({
            where: {
              docnum: { [Op.in]: xarr_docnum },
              postrntyp: "DISCOUNT",
              ordocnum: ordocnum,
              refund: 1,
            },
            attributes: [
              [
                fn(
                  "sum",
                  literal("CASE WHEN extprc=0 THEN amtdis ELSE extprc END")
                ),
                "discount",
              ],
            ],
            raw: true,
          })
        ).discount
      );

      const xcuscde = "WALKIN";
      const xcusdsc = "WALKIN";
      const xcusadd1 = "";

      let salesreturnfile1_data = {
        docnum: xsrtdocnum,
        warcde: data.warcde,
        cusdsc: xcusdsc,
        trncde: "SRT",
        trntot: trntot,
        smncde: orderinfo && orderinfo.cashier,
        trmcde: "CASH",
        cuscde: xcuscde,
        curcde: "PHP",
        usrnam: orderinfo && orderinfo.cashier,
        currte: 1,
        vatamt: vatamt,
        textprc: trntot,
        trntotfor: trntot,
        textprcfor: trntot,
        docapp: `SRT-${xsrtdocnum}`,
        docbal: 0,
        netvatamt: Number(acc_netvatamt).toFixed(2),
        docbalfor: 0,
        vatableamt: Number(acc_vatableamt).toFixed(2),
        vatexemptamt: vatexemptamt,
        vatamtfor: vatamt,
        netvatamtfor: Number(acc_netvatamt).toFixed(2),
        vatableamtfor: Number(acc_vatableamt).toFixed(2),
        vatexemptamtfor: vatexemptamt,
        totamtdis: -totalDiscount,
        totgroext: groext,
        totamtdisfor: -totalDiscount,
        totgroextfor: groext,
        netamt: trntot,
        netamtfor: trntot,
        logtim: orderinfo
          ? `${orderinfo.trndte} ${orderinfo.logtim}`
          : null,
        cusadd1: xcusadd1,
        manualewt: 0,
        doclock: "Y",
        trndte: orderinfo && orderinfo.trndte,
        duedate: orderinfo && orderinfo.trndte,
        logdte: orderinfo && orderinfo.trndte,
        brhcde: branchCode,
      };

      salesreturnfile1_arr.push(salesreturnfile1_data);
      //#endregion SALESRETURNFILE1

      //#region SALESRETURNFILE2
      // This will get all the item in specific order number
      let arrayItems = await posfileInstance
        .findAll({
          where: {
            docnum: { [Op.in]: xarr_docnum },
            postrntyp: "ITEM",
            ordocnum: ordocnum,
            forinv: 1,
          },
          attributes: [
            "recid",
            "itmcde",
            "itmqty",
            "untprc",
            "extprc",
            "netvatamt",
            "vatamt",
            "taxcde",
            "vatrte",
            "groprc",
          ],
          raw: true,
        });

      let linenum_index = 1;

      for (const item of arrayItems) {
        const posfile_item = await modelList.posfile.instance
          .GetInstance()
          .findOne({
            where: {
              recid: item.recid,
            },
            include: itemfile,
            raw: true,
          });

        const posfileDiscount = xarr_posfile.filter(
          (e) => e.postrntyp === "DISCOUNT" && e.ordocnum === ordocnum
        );

        //check if posfile_item = combo item
        if (!posfile_item.itmcomcde) {
          const iteminfo_arr = (
            await convertToAccounting_new_v2(posfile_item, posfileDiscount)
          ).iteminfo_arr;

          for (let iteminfo of iteminfo_arr) {
            const discountInfo =
              iteminfo.itemDiscInfo === undefined
                ? undefined
                : iteminfo.itemDiscInfo.length > 0
                ? iteminfo.itemDiscInfo[0]
                : undefined;

            let salesreturnfile2_data = {
              linegrp: 0,
              chkasy: 0,
              copyline: 0,
              scpwddis: 0,
              scpwdamt: 0,
              scpwdamtfor: 0,
              docnum: xsrtdocnum,
              cusdsc: xcusdsc,
              itmcde: iteminfo.itemCode,
              itmdsc: posfile_item["itemfile.itmdsc"],
              itmqty: iteminfo.itemQty,
              untprc: Number(iteminfo.itemUntPrc).toFixed(2),
              extprc: Number(iteminfo.itemExtprc).toFixed(2), // confirm
              trncde: "SRT",
              untmea: iteminfo.itemUntMea,
              prcdst1: 0,
              prcdst2: 0,
              prcdst3: 0,
              factor: -1,
              linenum: linenum_index,
              cuscde: `${xcuscde}`,
              warcde: posfile_item.warcde,
              groprc: Number(iteminfo.itemGroPrc).toFixed(2),
              prccde: "",
              sonum: "",
              disamt: 0,
              conver1: 0,
              smncde: orderinfo && orderinfo.cashier,
              usrnam: orderinfo && orderinfo.cashier,
              logtim: orderinfo
                ? `${orderinfo.trndte} ${orderinfo.logtim}`
                : null,
              curcde: "PHP",
              currte: 1,
              untprcfor: Number(iteminfo.itemUntPrc).toFixed(2),
              groprcfor: Number(iteminfo.itemGroPrc).toFixed(2),
              extprcfor: Number(iteminfo.itemExtprc).toFixed(2), // confirm
              disper:
                discountInfo || discountInfo !== undefined
                  ? discountInfo.disper
                  : 0,
              itmtyp: posfile_item["itemfile.itmtyp"],
              netvatamt: Number(iteminfo.itemNetVatAmt).toFixed(2),
              taxcde: iteminfo.itemTaxCde,
              vatamt: Number(iteminfo.itemVatAmt).toFixed(2), // confirm
              vatrte: iteminfo.itemVatRte,
              netvatamtfor: Number(iteminfo.itemNetVatAmt).toFixed(2), // confirm
              vatamtfor: Number(iteminfo.itemVatAmt).toFixed(2), // confirm
              amtdis: -Number(iteminfo.itemAmtDis).toFixed(2),
              groext: Number(iteminfo.itemGroExt).toFixed(2),
              amtdisfor: -Number(iteminfo.itemAmtDis).toFixed(2),
              groextfor: Number(iteminfo.itemGroExt).toFixed(2),
              dettyp: "I",
              trndte: orderinfo && orderinfo.trndte,
              logdte: orderinfo && orderinfo.trndte,
              barcodenum: iteminfo.itemBarcde,
              brhcde: branchCode,
              barcde: iteminfo.itemBarcde,
              disccde:
                discountInfo || discountInfo !== undefined
                  ? discountInfo.discde
                  : "",
              discper:
                discountInfo || discountInfo !== undefined
                  ? discountInfo.disper
                  : 0,
            };

            salesreturnfile2_arr.push(salesreturnfile2_data);
            linenum_index++;
          }
        }
      }
      //#endregion SALESRETURNFILE2
      xsrtdocnum = LNextsCentral(xsrtdocnum, "SRT", 7);
    }

    sendSocketMsg && sendMsg('Generating transactions data: 60%');

    //CHECK IF DUPLICATE OF SALESRETURNFILE1 AND SALESRETURNFILE2
    for (const xsrt1 of salesreturnfile1_arr) {
      // FOREACH SALES FILE 1
      const xcount = await modelList.salesreturnfile1.instance
        .GetInstance()
        .count({ where: { docnum: xsrt1.docnum } });
      if (xcount > 0) {
        // IF DOCNUM ALREADY EXISTS IN SALESRETURN 1, DELETES THE DATA
        const destroy = await modelList.salesreturnfile1.instance
          .GetInstance()
          .destroy({
            where: { docnum: xsrt1.docnum },
          });

        if (destroy) {
          const resSalesReturn = await modelList.salesreturnfile1.instance
            .GetInstance()
            .create(xsrt1);
          if (resSalesReturn) {
            const xarr_salesreturnfile2_filtered =
              salesreturnfile2_arr.filter(
                (xdata) => xdata.docnum == xsrt1.docnum
              );

            if (xarr_salesreturnfile2_filtered.length) {
              const xcount = await modelList.salesreturnfile2.instance
                .GetInstance()
                .count({
                  where: {
                    docnum: xarr_salesreturnfile2_filtered[0].docnum,
                  },
                });
              if (xcount > 0) {
                // IF DOCNUM ALREADY EXISTS IN SALESRETURNFILE 2, DELETES THE DATA
                const destroy = await modelList.salesreturnfile2.instance
                  .GetInstance()
                  .destroy({
                    where: {
                      docnum: xarr_salesreturnfile2_filtered[0].docnum,
                    },
                  });
                if (destroy) {
                  // ADD SALESRETURNFILE2
                  await modelList.salesreturnfile2.instance
                    .GetInstance()
                    .bulkCreate(xarr_salesreturnfile2_filtered);
                }
              }
            }
          }
        }
      }
    }

    sendSocketMsg && sendMsg('Generating transactions data: 70%');
    //#endregion

    //#region process transfer of transactions
    try {
      const xarr_params = {
        posfile: xarr_posfile,
        orderitemdiscountfile: xarr_orderitemdiscountfile,
        orderitemmodifierfile: orderitemmodifierfiles,
        salesfile1: salesfile1_arr,
        salesfile2: salesfile2_arr,
        salesreturnfile1: salesreturnfile1_arr,
        salesreturnfile2: salesreturnfile2_arr,
      };

      let xdata = JSON.stringify(xarr_params);

      const xpath = path.resolve(`./uploads/central/transaction/`);
      const datetoday = format(new Date(), "yyyyMMddhhmmss");
      const xcentral_filename = comcde
        ? `${comcde}_${datetoday}`
        : datetoday;
      const xfilename = `${xpath}/${xcentral_filename}`;

      if (!fs.existsSync(xpath)) {
        fs.mkdirSync(xpath, { recursive: true }, (err) =>
          console.error(`[_app.js]: ${err}`)
        );
      }

      sendSocketMsg && sendMsg('Generating transactions data: 80%');

      fs.writeFile(`${xfilename}.txt`, xdata, async (err) => {
        if (err) {
          cb("Error in generating the file [Err] => " + err)
          // res.send({
          //   success: false,
          //   message: "Error in generating the file [Err] => " + err,
          // });
        } else {
          const output = fs.createWriteStream(`${xfilename}.zip`);

          output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            cb(undefined, {
              success: true,
              filename: `${xfilename}.zip`,
              file: `${xcentral_filename}.zip`,
            })
          });

          const archive = archiver("zip-encryptable", {
            zlib: { level: 9 },
            forceLocalTime: true,
            password: `DareAngeL@2016`,
          });
          archive.pipe(output);
          archive.file(`${xfilename}.txt`, {
            name: `${xcentral_filename}.txt`,
          });
          await archive.finalize();

          sendSocketMsg && sendMsg('Generating transactions data: 100%');

          // cb(undefined, {
          //   success: true,
          //   filename: `${xfilename}.zip`,
          //   file: `${xcentral_filename}.zip`,
          // })
          // res.send();
        }
      });
    } catch (error) {
      console.error("error in generating file", error);
    }
    //#endregion
  }
}

module.exports = {generateTransferFile}