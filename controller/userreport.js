const { Filter } = require("../model");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = userReportEndpoints = () => {
  const userreport = modelList.userreport.instance;

  router.get("/filter", async (req, res) => {
    const filter = new Filter(req.query);
    const result = await userreport.ReadMany(filter.Get());

    res.status(200).json(result.rows);
  });

  return router;
};
