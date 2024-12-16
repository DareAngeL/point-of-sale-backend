
const { modelList } = require("../model/model")

const headerfile = modelList.headerfile.instance.GetInstance();
const syspar = modelList.systemparameters.instance.GetInstance();
const discfile = modelList.discount.instance.GetInstance();

const generatePosDatas = async (currentPosfiles, grandTotalPosfile) => {

    
    const headerfileFind = await headerfile.findOne({});
    const sysparFind = await syspar.findOne({raw: true});

    // Modification of data to suit the need of the mnall hook up.
    
    // Total posfiles
    const {allTotal, allItems, allRefunds, allVoid, allDiscounts, allVatAdj, allServiceCharge, allPayments} = currentPosfiles.reduce((acc, cur) => {
        
        if(cur.postrntyp == "TOTAL" && cur.refund == 0 && cur.void == 0)
            acc.allTotal.push(cur);

        if(cur.postrntyp == "ITEM" && cur.refund == 0 && cur.void == 0)
            acc.allItems.push(cur);

        if(cur.postrntyp == "DISCOUNT" && cur.refund == 0 && cur.void == 0)
            acc.allDiscounts.push(cur);

        if(cur.postrntyp == "SERVICE CHARGE" && cur.refund == 0 && cur.void == 0)
            acc.allServiceCharge.push(cur);

        if(cur.postrntyp == "Less VAT Adj." && cur.refund == 0 && cur.void == 0)
            acc.allVatAdj.push(cur);

        if(cur.postrntyp == "TOTAL" && cur.refund == 1)
            acc.allRefunds.push(cur);

        if((cur.postrntyp == "TOTAL" || cur.postrntyp == "SERVICE CHARGE") && cur.void == 1)
            acc.allVoid.push(cur);

        if((cur.postrntyp == "PAYMENT" || cur.postrntyp == "CHANGE") && cur.refund == 0 && cur.void == 0)
            acc.allPayments.push(cur);
        
        return acc;


    }, {allTotal: [], allItems: [], allRefunds: [], allVoid: [], allDiscounts: [], allVatAdj: [], allServiceCharge: [], allPayments: []});

    const serviceChargeDisc = allServiceCharge.reduce((acc, cur) => acc+= cur.amtdis*1 ,0);

    const grossSales = allTotal.reduce((acc, cur) => acc+=cur.vatamt*1>0?cur.groext*1:0, 0) + allServiceCharge.reduce((acc, cur) => acc+=cur.extprc*1, 0) - serviceChargeDisc;

    const nonTaxSales = allTotal.reduce((acc, cur) => acc+=cur.vatamt*1==0?cur.groext*1:0, 0)+ allServiceCharge.reduce((acc, cur) => acc+=cur.extprc*1, 0) - serviceChargeDisc;

    const {scPwdDisc, otherDisc} = allDiscounts.reduce((acc, cur) => {

        if(cur.itmcde == "Senior" || cur.itmcde == "PWD"){
            acc.scPwdDisc+=cur.amtdis*1;
        }
        else{
            acc.otherDisc+=cur.amtdis*1;
        }

        return acc;

    }, {scPwdDisc: 0, otherDisc: 0})

    
    const {totalCashSales, totalCardSales, totalOtherSales}= allPayments.reduce((acc, cur) => {


        if(cur.itmcde == "CASH") {
            acc.totalCashSales+=cur.extprc*1
        }
        else if(cur.itmcde == "CHANGE") {
            acc.totalCashSales-=cur.extprc*1
        }
        else if(cur.itmcde == "CARD"){
            acc.totalCardSales+=cur.extprc*1
        }
        else{
            acc.totalOtherSales+=cur.extprc*1
        }

        return acc;
    }, {totalCashSales: 0, totalCardSales: 0, totalOtherSales: 0});

    const totalCustomerCount = allTotal.reduce((acc, cur) => {
        
        if(!cur.customername){
            acc.count++;
            return acc;
        }

        if(!acc[cur.customername])
            acc[cur.customername] = 0;

        acc[cur.customername]++;
            
        return acc;
    }, {count: 0})

    const totalRefundAmount = allRefunds.reduce((acc, cur) => acc+=cur.extprc*1, 0);
    const totalVoidAmount = allVoid.reduce((acc, cur) => acc+=cur.extprc*1, 0);
    const totalVatAmount = allTotal.reduce((acc, cur) => acc+= cur.vatamt*1, 0);
    const totalServiceChargeAmount = allServiceCharge.reduce((acc, cur) => acc+= cur.extprc*1, 0);
    const totalVatAdj = allVatAdj.reduce((acc, cur) => acc+= cur.extprc*1, 0);
    const totalNetSalesAmount = grossSales - scPwdDisc - otherDisc - totalVatAdj - totalVoidAmount - totalRefundAmount - totalServiceChargeAmount;
    const totalCashSalesMinusRefund = totalCashSales - totalRefundAmount;


    console.log("PALATANDAAN",headerfileFind.tenantid);

    return {
        headerfileFind,
        grandTotalPosfile,
        currentPosfiles,
        allTotal, 
        allItems, 
        allRefunds, 
        allVoid, 
        allDiscounts, 
        allVatAdj, 
        allServiceCharge, 
        allPayments,
        totalRefundAmount,
        totalVoidAmount,
        totalVatAmount,
        totalServiceChargeAmount,
        totalVatAdj,
        totalNetSalesAmount,
        totalCashSalesMinusRefund,
        totalCustomerCount,
        totalCashSales, 
        totalCardSales, 
        totalOtherSales,
        nonTaxSales,
        grossSales,
        scPwdDisc, 
        otherDisc,
        sysparFind,
    };
}

// Will return array of group of per hour
const groupHourly = (posfilesTotal) => {

    const posfilesHourly = posfilesTotal.reduce((acc, cur) => {
        
        let returnHrs = 0;
        const logtim = cur.logtim;
        const [hours, mins] = logtim.split(":");

        returnHrs = parseInt(hours);

        if (returnHrs == 0){
            returnHrs = 24;
        }

        if(mins == "00"){
            returnHrs = returnHrs-1
        }

        if(!acc[returnHrs])
            acc[returnHrs] = []

        acc[returnHrs].push(cur);

        return acc;
    },{});

    return posfilesHourly;
}

const groupDiscount = async (posfileDisc) => {

    const getDiscount = await discfile.findAll({raw: true});

    console.log(getDiscount);

    const reducedDisc = posfileDisc.reduce((acc, cur) => {

        const disc = getDiscount.find(d=> d.discde == cur.discde);

        if(!acc[cur.discde]){
            acc[cur.discde] = {
                discde: cur.discde,
                disdsc: disc.disdsc,
                disamt: cur.amtdis*1
            };
        }
        else{
            acc[cur.discde].disamt += cur.amtdis*1;
        }
        return acc;

    }, {});

    return reducedDisc;
    
}


const getPosData = (data) => {

    const totalCustomerCount = data.reduce((acc, cur) => {
        
        if(!cur.customername){
            acc.count++;
            return acc;
        }

        if(!acc[cur.customername])
            acc[cur.customername] = 0;

        acc[cur.customername]++;
            
        return acc;
    }, {count: 0})


    return {
        // netSales: ,
        numberOfSales: data.length,
        customerCount: totalCustomerCount,
    }
    
};


module.exports = {
    generatePosDatas,
    getPosData,
    groupHourly,
    groupDiscount
}

