const { Op } = require("sequelize");
const { modelList } = require("../model/model");
const { Filter } = require("../model");
const { getDayDifference, convertToMinutes } = require("../helper/date-helper");
const { getConfig } = require("../socket/operation/operation-time");

const router = require("express").Router();

module.exports = homeInitEndpoints = () => {
  const menuModel = modelList.menus.instance.GetInstance();
  const trans = modelList.transaction.instance.GetInstance();
  const posfile = modelList.posfile.instance;
  const masterfilelog = modelList.masterfilelog.instance;
  const syspar = modelList.systemparameters.instance;
  const footer = modelList.footer.instance;
  const useraccess = modelList.useraccess.instance;
  const itemclass = modelList.itemclassification.instance.GetInstance();
  const itemsubclass = modelList.itemsubclassification.instance.GetInstance();
  const item = modelList.item.instance.GetInstance();
  const specialrequestdetail =
    modelList.specialrequestdetail.instance.GetInstance();
  const otherpayment = modelList.otherpayment.instance;
  const mallhookupfile2 = modelList.mallhookupfile2.instance.GetInstance();
  const mallhookupfile = modelList.mallhookupfile.instance.GetInstance();

  router.get("/", async (req, res) => {
    const { usrcde } = req.query;

    const sysparData = await syspar.Read();
    const pos = posfile.GetInstance();
    const headerfile = modelList.headerfile.instance;

    try {
      // #region UPDATE SYSTEM PARAMETERS
      // always enable the manual_dinetype ---> new implementation
      const sysparRes = await syspar.GetInstance().findOne({
        attributes: ["recid", "manual_dinetype"],
      });

      if (sysparRes && sysparRes.manual_dinetype*1 === 0) {
        await sysparRes.update({
          manual_dinetype: 1
        })
      }

      //#region GET MENUS MASTERFILE
      const allowPrinterStation = sysparData[0].allow_printerstation === 1;
      const findMenuMasterfile = await menuModel.findAll({
        where: {
          mengrp: "MASTERFILE",
          ...(allowPrinterStation
            ? {}
            : { mencap: { [Op.ne]: "PRINTER STATIONS" } }),
        },
      });
      //#endregion

      //#region GET HEADERFILE
      const findHeader = await headerfile.Read();
      //#endregion

      //#region GET NON ZREAD TRANSACTIONS
      const findNonZReadData = await pos.findAll({
        where: {
          batchnum: "",
          trnstat: 1,
        },
        order: ["recid"],
        attributes: ["trndte"],
      });
      //#endregion

      //#region GET ACTIVE TRANSACTIONS
      const findActiveTrans = await trans.findOne({
        where: {
          status: {
            [Op.or]: ["RECALL", "OPEN"],
          },
        },
        order: [["status", "DESC"]],
        raw: true,
      });
      //#endregion

      //#region GET LAST TRANSACTION
      // Check if the time is already past the time start (24hr format e.g. 00:00:00)
      const timeStart = sysparData[0].timestart;
      const timeEnd = sysparData[0].timeend;
      const timeExtension = sysparData[0].timeextension;
      const isExtended = sysparData[0].isextended;
      let currentEndTime = isExtended ? timeExtension : timeEnd;
      // const timeStart = syspar.timestart;
      const timeToday = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // Fetch today's last transaction
      let lastTransaction = await pos.findOne({
        // where: { trndte: dateTodayFormatter() },
        where: { batchnum: "" },
        order: [["recid", "DESC"]],
        raw: true,
      });

      // If there's no transaction for today, get the last transaction from previous days
      let lastT = true;
      if (!lastTransaction) {
        lastT = false;

        lastTransaction = await pos.findOne({
          order: [["recid", "DESC"]],
          raw: true,
        });

        if (!lastTransaction) {
          lastT = false;
        } else {
          const zreadDate = new Date(lastTransaction.trndte);
          const diffInDays = getDayDifference(zreadDate);

          console.log(
            "GEGE PAR",
            timeStart,
            timeToday,
            timeStart <= timeToday,
            diffInDays
          );

          if (diffInDays == 1) {
            if (
              lastTransaction?.itmcde == "GRANDTOTAL" &&
              timeStart > timeToday
            )
              lastT = true;
          } else {
            if (
              lastTransaction?.itmcde == "GRANDTOTAL" &&
              timeStart <= timeToday
            )
              lastT = true;
          }

          if (diffInDays > 1) lastT = false;
        }
      }

      if (lastTransaction) {
        lastTransaction = lastT
          ? { trntyp: lastTransaction.itmcde }
          : { trntyp: "EMPTY" };
      } else {
        lastTransaction = { trntyp: "EMPTY" };
      }

      console.log("lastttt", lastTransaction);
      //#endregion

      //#region GET CASHFUND
      const findCashFund = await pos.findOne({
        where: { postrntyp: "CASHFUND", batchnum: "" },
      });
      //#endregion

      //#region GET MASTERFILE LOG
      const findMasterfileLog = await masterfilelog.Read();
      //#endregion

      //#region GET FOOTER
      const findFooter = await footer.Read();
      //#endregion

      //#region GET TRANSACTIONS
      // const findTransactions = await trans.findAll({});

      //#region GET USER ACCESS
      const findUserAccess = await useraccess.GetInstance().findAll({
        where: {
          usrcde: usrcde,
          [Op.or]: [
            { usrcde: usrcde, allowadd: 1 },
            { usrcde: usrcde, allowdelete: 1 },
            { usrcde: usrcde, allowedit: 1 },
            { usrcde: usrcde, allowimport: 1 },
            { usrcde: usrcde, allowprint: 1 },
            { usrcde: usrcde, allowresend: 1 },
            { usrcde: usrcde, allowvoid: 1 },
          ],
        },
      });
      //#endregion

      //#region GET THEME
      // const findTheme = await themefile.Read();
      //#endregion

      //#region GET ALL ACTIVE HOLD TRANSACTIONS
      const findAllActiveHoldTransactions = await trans.findAndCountAll({
        where: {
          status: "HOLD"
        },
      });
      //#endregion

      //#region GET AUTOMATION OF SALES

      // Only activate this when central is connected
      let findAutoOfSales = {};

      if (sysparData[0].withtracc == 1) {
        const filter = new Filter({
          docnum: "like:POS-",
          trnstat: "1",
          is_corrupted: "1",
          _groupby: "docnum",
          _sortby: "trnsfrdte,docnum",
          _includes: "recid,docnum",
        });

        const filterObj = {
          ...filter.Get(),
          include: [
            { model: item, include: [itemclass, itemsubclass] },
            { model: specialrequestdetail },
          ],
        };

        findAutoOfSales = await posfile.GetInstance().findAll(filterObj);
      }
      //#endregion

      //#region GET MALLFIELDS
      const mallFields = await mallhookupfile.findOne({
        where: {
          recid: sysparData[0].active_mall,
        },
        include: [
          {
            model: mallhookupfile2,
            as: "mallfields",
          },
        ],
      });
      //#endregion

      //#region GET PAYMENT TYPE
      const findOtherpayment = await otherpayment.GetInstance().findAll();
      //#endregion


      let isEnd = async () => {
        const { timeEnd, lastCashfund, timeExtension, isExtended, timeStart } =
          await getConfig();

        const timeToday = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        if (lastCashfund) {
          //get the last cashfund date
          const lastCashfundDate = new Date(lastCashfund.trndte);

          //set the date within the timezone of manila
          const offsetInHours = 8;
          const adjustedDate = new Date(
            lastCashfundDate.getTime() + offsetInHours * 60 * 60 * 1000
          );
          const diffInDays = getDayDifference(adjustedDate);

          //get the time minutes
          const endTime = convertToMinutes(timeEnd);
          const nowTime = convertToMinutes(timeToday);
          const startTime = convertToMinutes(timeStart);
          const extensionTime = convertToMinutes(timeExtension || "00:00");

          //if extended or not and time diff
          let currentEndTime = isExtended ? extensionTime : endTime;
          const timeDifference = currentEndTime - startTime;

          console.log(`Diff Days`, diffInDays);
          console.log(`End Time`, endTime);
          console.log(`Now Time`, nowTime);
          console.log(`Start Time`, startTime);
          console.log(`Current End Time`, currentEndTime);
          console.log(
            `Time difference(currentEndTime - startTime)`,
            timeDifference
          );

          if (timeDifference < 0) {
            if (diffInDays == 1) {
              if (nowTime >= currentEndTime) {
                return true;
              }
            }
            return false;
          } else {
            if (nowTime >= currentEndTime) {
              return true;
            }
            return false;
          }
        }
      };

      const isEndTime = await isEnd();

      res.status(200).json({
        menus: findMenuMasterfile,
        header: findHeader,
        nonZRead: findNonZReadData,
        activeTrans: findActiveTrans,
        lastTransaction,
        cashFund: findCashFund,
        masterfileLog: findMasterfileLog,
        footer: findFooter,
        userAccess: findUserAccess,
        allActiveTransactions: findAllActiveHoldTransactions,
        autoOfSales: findAutoOfSales,
        mallFields,
        otherpayment: findOtherpayment,
        isEnd: isEndTime,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });

  return router;
};
