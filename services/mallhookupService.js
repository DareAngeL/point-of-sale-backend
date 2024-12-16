const { Op } = require("sequelize");
const {
  pad,
  mallHookupStringFormatter,
  roundUpTwoDigits,
  lastFourDigits,
  formatNumberDataV2,
} = require("../helper/stringHelper");
const { modelList } = require("../model/model");
const fs = require("fs");
const { sftpConnection, fileTransfer } = require("./sftp");
const { format, subDays } = require("date-fns");

const posfile = modelList.posfile.instance.GetInstance();
const headerfile = modelList.headerfile.instance.GetInstance();
const syspar = modelList.systemparameters.instance.GetInstance();
const mallhookupfile2 = modelList.mallhookupfile2.instance.GetInstance();
const forftpfile = modelList.forftpfile.instance.GetInstance();

async function generateRobinson(batchnum) {
  try {
    //#region Variable Declarations
    //syspar connections
    const sysparFind = await syspar.findOne({});
    //check date
    const checkDate = await posfile.findOne({
      attributes: ["trndte"],
      where: { postrntyp: "GRANDTOTAL", batchnum: batchnum },
    });
    const currentPosfile = await posfile.findAll({
      where: { trndte: checkDate.trndte },
    });
    const posfileGrandtotal = await posfile.findAll({
      where: {
        postrntyp: "GRANDTOTAL",
        batchnum: batchnum,
        trndte: checkDate.trndte,
      },
    });
    const checkDateValue = new Date(checkDate.trndte);
    const subDaysConvert = subDays(checkDateValue, 1);

    //current grand total
    const posfileGrandtotalCurrent =
      (await posfile.count({
        where: {
          postrntyp: "GRANDTOTAL",
          trndte: { [Op.lte]: checkDateValue },
        },
      })) || 0;

    //previous grand total
    const posfileGrandtotalprev = (await posfile.findOne({
      attributes: ["extprc"],
      where: {
        postrntyp: "GRANDTOTAL",
        trndte: subDaysConvert,
      },
    })) || { extprc: 0 };

    //eod count
    const posfileEODPrevCount =
      (await posfile.count({
        where: {
          postrntyp: "GRANDTOTAL",
          trndte: { [Op.lte]: subDaysConvert },
        },
      })) || 0;

    //robinsons needed fields
    const robinsonFields = await mallhookupfile2.findAll({
      where: { mall_id: sysparFind.active_mall },
    });
    //#endregion

    //#region Variable Values and Computations
    const tenantid = robinsonFields.find(
      (d) => d.label.toLowerCase() == "tenant id"
    ).value;
    const postrmno = robinsonFields.find(
      (d) => d.label.toLowerCase() == "pos terminal no."
    ).value;
    const sftpFilepath = robinsonFields.find(
      (d) => d.label.toLowerCase() == "path file"
    ).value;

    //Get Less Vat Adj
    const lessVatAdj = currentPosfile.filter(
      (d) => d.postrntyp == "Less Vat Adj." && d.void != 1 && d.refund != 1
    );

    //get all cards
    const allCards = currentPosfile.filter(
      (d) => d.itmcde == "CARD" && d.void != 1 && d.refund != 1
    );

    //get total reprinted
    const reprintedAmtTotal = currentPosfile.filter(
      (d) =>
        d.postrntyp === "TOTAL" &&
        d.reprinted_amt > 0 &&
        d.reprinted_amt !== null
    );

    //get ending BALANCE
    const endingBalance = currentPosfile.find(
      (d) => d.postrntyp == "GRANDTOTAL"
    );

    //get all with postrntyp ITEMS
    const getAllItem = currentPosfile.filter(
      (d) => d.postrntyp == "ITEM" && d.refund != 1
    );

    //get all with postrntyp DISCOUNT with itemcde Senior and PWD
    const getAllDiscount = currentPosfile.filter(
      (d) => d.postrntyp == "DISCOUNT"
    );

    //get all with postrntyp ITEM and void = 1
    const getAllVoid = currentPosfile.filter(
      (d) => d.postrntyp == "TOTAL" && d.void == 1
    );

    // Get all with postrntyp ITEM and refund = 1
    const getAllRefund = currentPosfile.filter(
      (d) => d.postrntyp == "TOTAL" && d.refund == 1
    );

    //get all with postrntyp ITEM and refund = 1
    const getAllSenior = currentPosfile.filter(
      (d) => d.postrntyp == "DISCOUNT" && d.itmcde == "Senior"
    );

    //get all with postrntyp ITEM and refund = 1
    const getAllRegularDiscount = currentPosfile.filter(
      (d) =>
        d.postrntyp == "DISCOUNT" &&
        d.itmcde != "PWD" &&
        d.itmcde != "Senior" &&
        d.void * 1 !== 1
    );

    //get all with postrntyp ITEM and scharge !=0
    const getAllWithServiceCharge = currentPosfile.filter(
      (d) => d.postrntyp == "ITEM" && d.scharge != 0
    );

    //count all the posfile (old)
    //const getAllGrandTotalCount = posfileGrandtotal.length;

    //computation total less vat adjustment
    const totalLessVatAdj = lessVatAdj.reduce(
      (acc, cur) => (acc += cur.extprc * 1),
      0
    );

    //computation total refund
    const totalRefund = getAllRefund.reduce(
      (acc, cur) => (acc += cur.groext * 1),
      0
    );

    //computation total service charge
    const totalServiceCharge = getAllWithServiceCharge.reduce(
      (acc, cur) => (acc += cur.scharge * 1),
      0
    );

    //compitation total void
    const totalVoid = getAllVoid.reduce(
      (acc, cur) => (acc += cur.groext * 1),
      0
    );

    //computation total card sales
    const totalCardSales = allCards.reduce(
      (acc, cur) => (acc += cur.extprc * 1),
      0
    );

    //new computation Total Reprinted Amount
    const totalReprintedAmt = reprintedAmtTotal.reduce(
      (acc, cur) => acc + cur.extprc * 1,
      0
    );
    const totalReprintedQty = endingBalance.reprinted;

    //computation selled gc
    const totalSelledGC = getAllItem.reduce((acc, cur) => {
      if (cur.itmdsc.includes("GC")) {
        acc += cur.groext * 1;
      }

      return acc;
    }, 0);

    //computation Total of discounts
    const discountTotal = getAllDiscount.reduce(
      (acc, cur) => {
        if (cur.itmcde == "Senior" && cur.void != 1 && cur.refund != 1) {
          acc.senior += cur.groext * 1;
        } else if (cur.itmcde == "PWD" && cur.void != 1 && cur.refund != 1) {
          acc.pwd += cur.groext * 1;
        } else if (
          cur.itmcde != "Senior" &&
          cur.itmcde != "PWD" &&
          cur.void != 1 &&
          cur.refund != 1
        ) {
          acc.regular += cur.groext * 1;
        }

        return acc;
      },
      { senior: 0, pwd: 0, regular: 0 }
    );

    //computation Total of vatsales, extprc
    let total = getAllItem.reduce(
      (acc, cur) => {
        acc.vatSales += cur.vatamt * 1;
        acc.grossSales += cur.groext * 1;

        return acc;
      },
      { vatSales: 0, grossSales: 0 }
    );
    total = {
      grossSales: total.grossSales - totalVoid - totalRefund - totalLessVatAdj,
      vatSales: total.vatSales,
    };

    //computation Total Non Vat Sales
    const totalNonVatSalesComp = roundUpTwoDigits(
      ((discountTotal.senior + discountTotal.pwd) / 0.02) * 0.08
    );

    //Get and compute of kiosk sales with roundoff
    const kioskSalesRoundOff = roundUpTwoDigits(totalSelledGC);

    // // ENDING BALANCE
    // const beginningBalance = total.grossSales - endingBalance.extprc;
    //#endregion

    //#region File Output
    const returnObj = {
      // !!! -> not required to be 2 decimal no
      /*01*/ tenantid: tenantid,
      /*02!!!*/ terminalno: postrmno,
      /*03*/ grossSales: roundUpTwoDigits(total.grossSales).toFixed(2),
      /*04*/ totalVatSales: roundUpTwoDigits(
        ((total.grossSales -
          discountTotal.senior -
          discountTotal.pwd -
          totalNonVatSalesComp -
          kioskSalesRoundOff) /
          1.12) *
          0.12
      ).toFixed(2),
      /*05*/ totalAmountVoid: roundUpTwoDigits(totalVoid).toFixed(2),
      /*06!!!*/ voidQty: getAllVoid.length,
      /*07*/ totalAmountRegDisc: roundUpTwoDigits(
        discountTotal.regular
      ).toFixed(2),
      /*08!!!*/ discQty: getAllRegularDiscount.length,
      /*09*/ totalAmountRefund: roundUpTwoDigits(totalRefund).toFixed(2),
      /*10!!!*/ refundQty: getAllRefund.length,
      /*11*/ totalAmountSenior: roundUpTwoDigits(discountTotal.senior).toFixed(
        2
      ),
      /*12!!!*/ seniorQty: getAllSenior.length,
      /*13*/ totalServiceCharge:
        roundUpTwoDigits(totalServiceCharge).toFixed(2),
      /*14!!!*/ eodCounter: posfileEODPrevCount,
      /*15*/ beginningSales: roundUpTwoDigits(
        posfileGrandtotalprev.extprc
      ).toFixed(2),
      /*16!!!*/ eodCounterCurrent: posfileGrandtotalCurrent,
      /*17*/ endingSales: roundUpTwoDigits(endingBalance.extprc).toFixed(2),
      /*18*/ salesTransactionDate: format(
        new Date(currentPosfile[0].trndte),
        "MM/dd/yyyy"
      ),
      /*19*/ novelty: roundUpTwoDigits(0).toFixed(2),
      /*20*/ misc: roundUpTwoDigits(0).toFixed(2),
      /*21*/ localTax: roundUpTwoDigits(0).toFixed(2),
      /*22*/ totalCreditSales: roundUpTwoDigits(totalCardSales).toFixed(2),
      /*23*/ totalCreditTax: roundUpTwoDigits(
        (totalCardSales / 1.12) * 0.12
      ).toFixed(2),
      /*24*/ totalNonVatSales: totalNonVatSalesComp.toFixed(2),
      /*25*/ pharmaSales: roundUpTwoDigits(0).toFixed(2),
      /*26*/ nonPharmaSales: roundUpTwoDigits(0).toFixed(2),
      /*27*/ totalAmountPWD: roundUpTwoDigits(discountTotal.pwd).toFixed(2),
      /*28*/ kioskSales: kioskSalesRoundOff.toFixed(2),
      /*29*/ totalAmountReprinted:
        roundUpTwoDigits(totalReprintedAmt).toFixed(2),
      /*30!!!*/ reprintedQty: roundUpTwoDigits(totalReprintedQty),
    };
    //#endregion

    //#region Filename and Batch no
    const curBatchNo = (await forftpfile.findOne({
      attributes: ["batchno"],
      where: {
        salesdte: currentPosfile[0].trndte,
      },
    })) ?? { batchno: 0 };

    let filename = `${lastFourDigits(tenantid)}${format(
      new Date(currentPosfile[0].trndte),
      "MMdd"
    )}.${pad(2, postrmno)}1`;

    //latest batch no
    const prevFilename =
      filename.substring(0, filename.length - 1) +
      curBatchNo.batchno.toString();
    filename =
      filename.substring(0, filename.length - 1) +
      (parseFloat(curBatchNo.batchno) + 1).toString();
    //#endregion

    //#region Locally Save File
    //delete prev file name
    fs.access(`sftp/${prevFilename}`, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("File does not exist");
        return;
      }
      fs.unlink(`sftp/${prevFilename}`, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }
        console.log("File deleted successfully");
      });
    });
    //create new file name (feels like overwrite but created with new batchno)
    const stream = fs.createWriteStream(`sftp/${filename}`);
    stream.on("error", (err) => {
      console.error("Error writing to file:", err);
    });

    const mallFileValues = Object.values(returnObj);
    mallFileValues.forEach((d, i) => {
      const formattedString = mallHookupStringFormatter(i + 1, d);
      stream.write(formattedString + "\n");
    });
    stream.end();
    //#endregion

    //#region SFTP Sent File
    await robinsonSftpSendServices(
      filename,
      batchnum,
      sftpFilepath,
      curBatchNo.batchno,
      currentPosfile[0].trndte,
      posfileEODPrevCount,
      posfileGrandtotalCurrent
    );
    //#endregion

    console.log(returnObj);
    console.log("Done executing services: generateRobinson");
    return returnObj;
  } catch (error) {
    console.log("There's a problem while running this services", error);
  }
}

async function robinsonSftpSendServices(
  filename,
  batchnum,
  sftpFilepath,
  curBatchNo,
  salesdte,
  posfileEODPrevCount,
  posfileGrandtotalCurrent
) {
  let sftpClient;
  try {
    sftpClient = await sftpConnection();
    if (!sftpClient) {
      console.log("Failed to connect to RLC server");
    }
    //transfer the file onto the sftpserver
    const fsTrans = await fileTransfer(
      sftpClient,
      "sftp/" + filename,
      sftpFilepath + filename
    );  

    //logs validation
    const sentFile = await forftpfile.findAll({
      where: {
        salesdte: salesdte,
        batchnum: batchnum,
      },
    });

    //update or create function
    const updateOrCreate = async (dateSent) => {
      const setFields = {
        batchnum: batchnum,
        batchno: parseFloat(curBatchNo) + 1,
        curreod: posfileEODPrevCount + 1,
        currgtot: posfileGrandtotalCurrent,
        filename: filename,
        datesent: dateSent,
      };
      if (sentFile.length > 0) {
        //if exist then it will update logs
        await forftpfile.update(setFields, {
          where: {
            salesdte: salesdte,
          },
        });
      } else {
        //if not exist then it will create logs
        await forftpfile.create({
          ...setFields,
          salesdte: salesdte,
        });
      }
    };

    if (fsTrans) {
      //if already sent
      const dateNow = new Date();
      await updateOrCreate(dateNow);
      console.log("Success fully transfer data on the server");
    } else {
      //if not yet sent
      const defaultDate = new Date("1970-01-01T00:00:00");
      await updateOrCreate(defaultDate);
      throw new Error(
        "Failed to transfer data on the server, please check internet connection"
      );
    }
  } catch (e) {
    console.log(
      "There's an error while running this services: robinsonSftpSendServices"
    );
    throw e;
  } finally {
    if (sftpClient) {
      await sftpClient.end();
    }
  }
}

async function viewList() {
  try {
    const viewSent = await forftpfile.findAll({
      attributes: ["filename", "salesdte", "datesent"],
      where: {
        datesent: {
          [Op.ne]: "1970-01-01",
        },
      },
      raw: true,
    });

    return viewSent;
  } catch (error) {
    console.log("There's an error while running this services");
  }
}

async function generateStalucia(batchnum, trndte) {
  const day = new Date(trndte).getDate();
  const activeMall = await syspar.findOne({ attributes: ["active_mall"] });

  const currentPosfile = await posfile.findAll({
    where: { batchnum: batchnum },
  });
  const headerfileFind = await headerfile.findOne({});

  const posfileTotalList = currentPosfile.filter(
    (val) => val.postrntyp === "TOTAL"
  );

  const staLuciaMall = await mallhookupfile2.findOne({
    where: { mall_id: activeMall.active_mall },
  });
  //PAD 2 with the terminal no.
  const terminalNo = pad(2, headerfileFind.postrmno);

  // Filtering it in orderpercode
  const posfileListPerOrdercode = currentPosfile.reduce((acc, cur) => {
    const key =
      cur.ordocnum +
      `-${cur.refund == 1 ? "REFUND" : cur.void == 1 ? "VOID" : ""}`;

    if (!acc.hasOwnProperty(key)) {
      acc[key] = [];
    }

    if (cur.void == 1) {
      if (!acc.hasOwnProperty(`${cur.ordercde}-`)) {
        acc[`${cur.ordercde}-`] = [];
      }
      acc[`${cur.ordercde}-`].push(cur);
    }

    acc[key].push(cur);

    return acc;
  }, {});

  // Initializing the return objects and return arrays
  let returnObj = {};
  let returnArr = [];

  // Process the creation of file
  process.chdir("C:/");

  if (!fs.existsSync("STALUCIA")) {
    fs.mkdirSync("STALUCIA");
  }

  fs.stat("STALUCIA/TENANT.DAT", (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        console.log("File does not exist");
        const stream = fs.createWriteStream(`STALUCIA/TENANT.DAT`);
        stream.write(staLuciaMall.value + "");
        return;
      }
      console.error("Error occurred while checking file:", err);
      return;
    }
    console.log("File exists");
  });

  if (!fs.existsSync("STALUCIA")) {
    fs.mkdirSync("STALUCIA");
  }

  const filepath = `${format(new Date(trndte), "MMddyyyy")}.SLE`;
  const stream = fs.createWriteStream(`STALUCIA/${filepath}`);

  stream.on("error", (err) => {
    console.error("Error writing to file:", err);
  });

  if (!posfileTotalList || posfileTotalList.length == 0) {
    stream.write(
      `"${staLuciaMall.value}",0,"${format(
        new Date(trndte),
        "MM/dd/yyyy"
      )}","00:00",0,0.00,0.00,0.00,0.00,0.00,"S"`
    );
  } else {
    // Traversing through the list of transactions.
    posfileTotalList.forEach((data) => {
      const lessVatAdj = currentPosfile.find(
        (curPos) =>
          curPos.ordercde == data.ordercde &&
          curPos.postrntyp.toLowerCase() == "less vat adj."
      );

      const key =
        data.ordocnum +
        `-${data.refund == 1 ? "REFUND" : data.void == 1 ? "VOID" : ""}`;

      console.log("pointblank", key);

      const splitCode = data.ordocnum.split("-");
      const convertToNum = Number(splitCode[1]);
      const transactionNo = pad(7, convertToNum);

      let transactionType =
        data.void == 0 && data.refund == 0 ? "S" : data.void == 1 ? "V" : "R";

      const posfileList = posfileListPerOrdercode[key];

      const posfileSum = posfileList.reduce(
        (acc, cur) => {
          if (cur.postrntyp == "ITEM") {
            acc.extprc += cur.extprc * 1;
            acc.groext += cur.groext * 1;
            acc.untprc += cur.untprc * 1;
            acc.vatamt += cur.vatamt * 1;
            acc.qty += cur.itmqty * 1;
            acc.vatexempt += cur.vatexempt * 1;
          } else if (cur.postrntyp == "DISCOUNT") {
            // Senior, PWD, Diplomat -- These are VAT exempted

            if (cur.itmcde == "MOV") acc.discount += cur.amtdis * 1;
            else acc.discount += cur.extprc * 1;
          } else if (cur.postrntyp == "SERVICE CHARGE") {
            acc.scharge += cur.extprc * 1;
          }

          return acc;
        },
        {
          extprc: 0,
          groext: 0,
          untprc: 0,
          discount: 0,
          qty: 0,
          vatamt: 0,
          scharge: 0,
          vatexempt: 0,
          vatexempted: 0,
        }
      );

      const unitPrice = posfileSum.extprc + posfileSum.discount;
      const grossSale = unitPrice + posfileSum.scharge;
      const taxes = posfileSum.vatamt;
      const netsales =
        grossSale - posfileSum.discount - taxes - posfileSum.scharge;

      const realTransactionDate = new Date(data.trndte);

      const hours = realTransactionDate.getHours();
      const minutes = realTransactionDate.getMinutes();
      const seconds = realTransactionDate.getSeconds();
      const milliseconds = realTransactionDate.getMilliseconds();

      const transactionDate = new Date(trndte);
      transactionDate.setHours(hours);
      transactionDate.setMinutes(minutes);
      transactionDate.setSeconds(seconds);
      transactionDate.setMilliseconds(milliseconds);

      returnObj = {
        tenantCode: staLuciaMall.value,
        transactionNo: `${terminalNo}${transactionNo}`,
        transactionDate: format(transactionDate, "MM/dd/yyyy"),
        transactionTime: data.logtim.split(":").slice(0, 2).join(":"),
        quantity: 1,
        unitPrice: unitPrice,
        grossSale: grossSale,
        discount: posfileSum.discount,
        taxes: taxes,
        netSales: netsales,
        transactionType: transactionType,
      };

      const processTextFileReturnObj = Object.values(returnObj);
      const processTextFileReturnObjNonVoid = Object.values({
        ...returnObj,
        transactionType: "S",
      });

      if (data.void == 1) {
        processTextFileReturnObjNonVoid.forEach((d, i) => {
          if (i < 4 || i == processTextFileReturnObjNonVoid.length - 1) {
            stream.write(`"${d}",`);
          } else {
            if (i == 4) stream.write(d + ",");
            else if (i != 10) stream.write(formatNumberDataV2(d) + ",");
            else stream.write(formatNumberDataV2(d) + "");
          }
        });

        stream.write("\n");
        returnArr.push({ ...returnObj, transactionType: "S" });
      }

      processTextFileReturnObj.forEach((d, i) => {
        if (i < 4 || i == processTextFileReturnObj.length - 1) {
          stream.write(`"${d}",`);
        } else {
          if (i == 4) stream.write(d + ",");
          else if (i != 10) stream.write(formatNumberDataV2(d) + ",");
          else stream.write(formatNumberDataV2(d) + "");
        }
      });

      stream.write("\n");

      returnArr.push(returnObj);
    });
  }

  stream.end();

  return returnArr;
}

module.exports = {
  generateRobinson,
  generateStalucia,
  viewList,
  posfile,
  headerfile,
  syspar,
};
