
const {itemizedManagersReport, dailyDineType, voidTransactions, refundByDate, refundTransaction, perDayHourly, perOrderTaker, eSales, salesSummary, dailySales, paymentType, freeTransaction, birReports, paymentByDinetype} = require("../model/posfile/managers_report");
const {Op} = require("sequelize");
const { documentCount } = require("../model/utilities");

const managersReport = async (wsConnection, from, to, reportType, dineTypeList) => {

    const chunk = 1000;
    let start = 0;

    let find;
    // find = await generateManagersReport("2022-07-31", "2022-08-01", 0, 100);

    console.log("Entered the realm");
    console.log("try lang kung anong report to", reportType);
    console.log("Entered the realm:", dineTypeList);

    if(reportType === 'ITEMIZED' || reportType === 'CLASSANDSUBCLASS' ||  reportType === 'COSTANDPROFIT'){
        while(true){
            find = await itemizedManagersReport(from, to, start, chunk);
    
            if(find.length <=0){

                // Throttling before sending end for the data to be transferred correctly
                await new Promise(resolve => setTimeout(resolve, 1000));

                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === 'DAILYDINETYPE' || reportType === 'HOURLYSALES'){

        while(true){
            find = await dailyDineType(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
    
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === 'VOIDTRANSACTIONS'){

        while(true){
            find = await voidTransactions(from, to, start, chunk);
    
            if(find.length <=0){
    
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
        
    }
    if(reportType === 'REFUNDBYDATE' || reportType === 'REFUNDBYPAYMENT'){

        while(true){
            find = await refundByDate(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
        
    }
    if(reportType == 'REFUNDTRANSACTIONS'){
        while(true){
            find = await refundTransaction(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
        
    }
    if(reportType === 'PERDAYHOURLY'){

        const query = 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "PAYMENT",
            refund: 0
        }

        const docCount = await documentCount(query);

        while(true){
            find = await perDayHourly(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: [], count: docCount}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
        
    }

    if(reportType === 'PERDAYHOURLY'){

        const query = 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "PAYMENT",
            refund: 0
        }

        const docCount = await documentCount(query);

        while(true){
            find = await perDayHourly(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: [], count: docCount}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
        
    }
    if(reportType === 'PERORDERTAKER'){

        const query = 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "PAYMENT",
            refund: 0
        }

        const docCount = await documentCount(query);

        while(true){
            find = await perOrderTaker(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: [], count: docCount}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === 'ESALES'){

        const query = 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "PAYMENT",
            refund: 0
        }

        const docCount = await documentCount(query);

        while(true){
            find = await eSales(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: [], count: docCount}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === 'SALESSUMMARY'){
        while(true){
            find = await salesSummary(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === 'DAILYSALES'){
        
        while(true){
            find = await dailySales(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === 'PAYMENTTYPE'){
        while(true){
            find = await paymentType(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if(reportType === "SENIORCITIZEN" || reportType === "PWD" || reportType === "ATHLETES" || reportType === "DIPLOMAT" || reportType === "SOLOPARENT"){
        while(true){
            find = await birReports(from, to, start, chunk);
    
            if(find.length <=0){
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
                break;
            }
            else{
                wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
                start+=chunk
            }
        }
    }
    if (reportType === 'FREE') {
      while(true) {
        find = await freeTransaction(dineTypeList, from, to, start, chunk);

        if(find.length <=0){
                
          await new Promise(resolve => setTimeout(resolve, 1000));
          wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
          break;
        }
        else{
          wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
          start+=chunk
        }
      }
    }
    if (reportType === 'PAYMENTBYDINETYPE') {
        while(true) {
            find = await paymentByDinetype(dineTypeList, from, to, start, chunk);
    
            if(find.length <=0){
                    
              await new Promise(resolve => setTimeout(resolve, 1000));
              wsConnection.send(JSON.stringify({message: "message", status: "end", data: []}));
              break;
            }
            else{
              wsConnection.send(JSON.stringify({message: "message", status: "ongoing", data: find}));
              start+=chunk
            }
          }
    }
}



module.exports = {managersReport}