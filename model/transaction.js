const {modelList} = require("../model/model");
const sequelize = initDatabase();

const createTransaction = async (recid) => {
  const updatedOrderCode = await transaction.UpdateId("ordercde");
  const updatedOrNumber = await syspar.UpdateId("ordocnum");
  const updatedDocnum = await syspar.UpdateId("posdocnum");
  const updatedBillDocnum = await syspar.UpdateId("billdocnum");

  const openTime = new Date();

  const updatedObject = {
    ...req.body,
    ordercde: updatedOrderCode,
    opentime: openTime,
  };

  return await transaction.CreateOrUpdate(
    {recid: recid},
    updatedObject,
    "seqnum",
    "tabletrncde"
  );
};

module.exports = {createTransaction: createTransaction};
