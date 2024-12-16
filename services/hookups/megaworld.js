
const { pad, roundUpTwoDigitsV2 } = require("../../helper/stringHelper");
const { generatePosDatas, groupHourly, groupDiscount } = require("../posdataService");
const { getNumMonth, getDayOfMonth } = require("../../helper/date-helper");
const { saveFile } = require("../../helper/saving-file");
const { modelList } = require("../../model/model")
const { format } = require("date-fns");
const fs = require('fs');

const posfile = modelList.posfile.instance.GetInstance();
const syspar = modelList.systemparameters.instance.GetInstance();
// const headerfile = modelList.headerfile.instance.GetInstance();

async function generateMegaworld(batchnum){
    const findSyspar = await syspar.findOne({raw: true});
    const currentPosfiles = await posfile.findAll({ where: {batchnum: batchnum}, raw: true});
    const posfileGrandtotal = await posfile.findOne({where : {postrntyp: "GRANDTOTAL", batchnum: batchnum}, raw: true});

    const {
        headerfileFind,
        grandTotalPosfile,
        allTotal,
        totalRefundAmount,
        totalVoidAmount,
        totalVatAmount,
        totalServiceChargeAmount,
        totalNetSalesAmount,
        totalCashSalesMinusRefund,
        totalCustomerCount,
        totalCardSales, 
        totalOtherSales,
        nonTaxSales,
        grossSales,
        scPwdDisc, 
        otherDisc,
        allDiscounts
    } = await generatePosDatas(currentPosfiles, posfileGrandtotal);


    const dailySales = {
        tenantid: (headerfileFind.tenantid+"").slice(0,4),
        terminalno: headerfileFind.postrmno,
        trndte: format(new Date(), "MMddyyyy"),
        oldAccumulated: roundUpTwoDigitsV2(grandTotalPosfile.extprc*1 - totalNetSalesAmount),
        newAccumuluated: roundUpTwoDigitsV2(grandTotalPosfile.extprc*1),
        grossSales: roundUpTwoDigitsV2(grossSales),
        nonTaxsales: roundUpTwoDigitsV2(nonTaxSales),
        discScPwd: roundUpTwoDigitsV2(scPwdDisc),
        otherDisc: roundUpTwoDigitsV2(otherDisc),
        totalRefundAmount: roundUpTwoDigitsV2(totalRefundAmount),
        totalVatAmount: roundUpTwoDigitsV2(totalVatAmount),
        totalServiceChargeAmount: roundUpTwoDigitsV2(totalServiceChargeAmount),
        totalNetSalesAmount: roundUpTwoDigitsV2(totalNetSalesAmount),
        totalCashSales: roundUpTwoDigitsV2(totalCashSalesMinusRefund),
        totalCardSales: roundUpTwoDigitsV2(totalCardSales),
        totalOtherSales: roundUpTwoDigitsV2(totalOtherSales),
        totalVoidAmount: roundUpTwoDigitsV2(totalVoidAmount),
        totalCustomerCount: totalCustomerCount.count + (Object.values(totalCustomerCount).length - 1),
        controlNumber: 1,
        totalNumberOfSalesTransaction: allTotal.length,
        totalSales: "01",
        netSalesAmount: roundUpTwoDigitsV2(totalNetSalesAmount)
    }

    //#region Daily Sales Save
    let directory = findSyspar.pathfile;

    try {
        // Change the current working directory
        process.chdir(directory);
        console.log(`Changed working directory to: ${directory}`);
    } catch (error) {
        process.chdir("C:/");
        console.error(`Error changing directory: ${error.message}`);
    }

    if(!fs.existsSync("MEGAWORLD")){
        fs.mkdirSync("MEGAWORLD");
    }

    const filepath =`S${(headerfileFind.tenantid+"").slice(0,4)}${pad(2, headerfileFind.postrmno)}1.${getNumMonth(new Date())}${pad(2, getDayOfMonth(new Date()))}`;

    saveFile(`MEGAWORLD/${filepath}`, dailySales, true, 2);

    //#endregion

    //#region Hourly Sales Saving

    const dailyHourlySales = {
        tenantid: headerfileFind.tenantid,
        terminalno: headerfileFind.postrmno,
        trndte: format(new Date(), "MMddyyyy"),
    }
    
    const hourlyMapped = groupHourly(allTotal);
    const keysHourly = Object.keys(hourlyMapped);
    const hourlyData = [];

    for(const d of keysHourly){

        const perHour = hourlyMapped[d][0]
        const posfilesHourly = currentPosfiles.filter((cp)=> cp.ordocnum == perHour.ordocnum); 


        console.log("PER ORAS PAREH", d);

        const {
            totalNetSalesAmount: totalNetSalesAmountHourly,
            allTotal: allTotalHourly,
            totalCustomerCount: totalCustomerCountHourly
        } = await generatePosDatas(posfilesHourly, posfileGrandtotal);


        hourlyData.push({
            netSales: roundUpTwoDigitsV2(totalNetSalesAmountHourly),
            noOfSales: allTotalHourly.length,
            customerCount: totalCustomerCountHourly.count  + (Object.values(totalCustomerCountHourly).length - 1), 
        });

    }

    const saveFileData = {
        ...dailyHourlySales,
        repeat: hourlyData
    };

    const filepathHourly =`H${(headerfileFind.tenantid+"").slice(0,4)}${pad(2, headerfileFind.postrmno)}1.${getNumMonth(new Date())}${pad(2, getDayOfMonth(new Date()))}`;

    saveFile(`MEGAWORLD/${filepathHourly}`, saveFileData, true, 2);

    // Get all per hourly and insert the generatePOsData
    const dailyDiscount = await groupDiscount(allDiscounts);

    const filepathDiscount =`D${(headerfileFind.tenantid+"").slice(0,4)}${pad(2, headerfileFind.postrmno)}1.${getNumMonth(new Date())}${pad(2, getDayOfMonth(new Date()))}`;

    discountSaveFile(filepathDiscount, dailyDiscount);


    return dailyDiscount;

}

const discountSaveFile = (filepath, obj) => {
    const stream = fs.createWriteStream(`MEGAWORLD/${filepath}`)

    stream.on('error', err => {
        console.error('Error writing to file:', err);
    });
    
    const keysDiscount = Object.keys(obj);

    keysDiscount.forEach(d => {
        
        const currentDisc = dailyDiscount[d];

        stream.write(`${currentDisc.discde},${currentDisc.disdsc},${roundUpTwoDigitsV2(currentDisc.disamt)}\n`);

    });

    stream.end();
}

module.exports = {
    generateMegaworld
}
