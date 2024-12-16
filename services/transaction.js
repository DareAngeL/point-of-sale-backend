const { dateTimeTodayFormatter } = require("../helper");

const checkRecallAndCloseTransaction = async (model) => {
    const [recall, openTran] = await Promise.all([
        await model.findOne({
          where:{
            status: "RECALL"
          }
        }),
        await model.findOne({
          where:{
            status: "OPEN"
          }
        })
      ]);

      if(recall) {
        recall.update({status: "CLOSED", closetime: dateTimeTodayFormatter()});
  
        return {
          ...openTran,
          isFromRecall: true
        };
        
      }
      else{
        if (openTran) {
          openTran.update({status: "CLOSED", closetime: dateTimeTodayFormatter()});
        }
  
        return {isFromRecall: false};
      }
}

module.exports = {checkRecallAndCloseTransaction}