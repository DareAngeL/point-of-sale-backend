const { timeTodayFormatter, dateTodayFormatter } = require("../../helper");
const { modelList } = require("../model");
const { computeTotal } = require("./compute_total");

const freeAllItem = async (freeObj) => {
  // const posfile = modelList.posfile.instance.GetInstance();
  const posfileordering = modelList.posorderingfile.instance.GetInstance();
  const transaction = modelList.transaction.instance.GetInstance();
  const header = modelList.headerfile.instance.GetInstance();

  const findHeader = await header.findOne({});
  const openTran = await transaction.findOne({where: {status: "OPEN"}});
  const item = await posfileordering.findOne({where: {postrntyp: "ITEM", ordercde: openTran.ordercde}, raw: true});

  delete item.recid;
  delete item.itmdsc;
  delete item.orderitmid;
  delete item.taxcde;
  const freeTransactionTemplate = {
    ...item,
    grossprc: 0,
    groext: 0,
    extprc: 0,
    untprc: 0,
    groprc: 0,
    netvatamt: 0,
    vatamt: 0,
    disamt: 0,
    scharge: 0,
    vatrte: 0,
    mainitmid: "",
    mainitmcde: "",
    freereason: freeObj.freereason,
    itmcde: "FREE TRANSACTION",
    itmqty: 1,
    logtim: timeTodayFormatter(),
    numpax: 1,
    postrmno: findHeader.postrmno,
    postrntyp: "FREE TRANSACTION",
    trncde: "POS",
    trndte: dateTodayFormatter(),
    itmpaxcount: 1,
    trnstat: 1,
  }

  const updateAllItem = await posfileordering.update(
    {
      groext: 0,
      extprc: 0,
      untprc: 0,
      groprc: 0,
      netvatamt: 0,
      vatamt: 0,
      disamt: 0,
      scharge: 0,
      freereason: freeObj.freereason,
      customername: freeObj.customername,
      address: freeObj.address,
      tin: freeObj.tin,
      contactno: freeObj.contactno,
    },
    {
      where: {
        postrntyp: "ITEM",
        ordercde: openTran.ordercde,
      },
    }
  );

  await posfileordering.create(freeTransactionTemplate);
  await computeTotal(null, {postrntyp: "ITEM", ordercde: openTran.ordercde});

  return updateAllItem;
};


module.exports = {freeAllItem: freeAllItem};