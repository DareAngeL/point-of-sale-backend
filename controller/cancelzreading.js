const { dateTodayFormatter } = require("../helper");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = cardtypeEndpoints = () => {

  const posfile = modelList["posfile"].instance;

  router.post("/", async (req, res) => {
    // get all the posfiles for the current date
    const posfiles = await posfile.GetInstance().findOne({
      where: {
        trndte: dateTodayFormatter(),
      },
      attributes: ["batchnum"],
      order: [["batchnum", "DESC"]]
    });
    
    // check if there is a posfile for the current date
    if (!posfiles) {
      return res.status(200).json({
        status: 404,
        message: "No POS file found for the current date."
      });
    }

    if (posfiles.batchnum === "") {
      return res.status(200).json({
        status: 404,
        message: "No Z-Reading to cancel."
      });
    }

    // remove the last zreading
    await posfile.GetInstance().destroy({
      where: {
        batchnum: posfiles.batchnum,
        postrntyp: 'GRANDTOTAL'
      }
    });
    await posfile.GetInstance().update({
      batchnum: "",
    }, {
      where: {
        batchnum: posfiles.batchnum,
      }
    });

    return res.status(200).json({
      status: 200,
      message: "Z-Reading successfully cancelled."
    });
  });

  return router;
}