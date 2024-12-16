const {Filter} = require("../model");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = userActivityLogEndpoints = () => {
  const useractivitylog = modelList.useractivitylog.instance;

  router.get("/", async (req, res) => {
    const filter = new Filter(req.query);
    const result = await useractivitylog.ReadMany(filter.Get());
    res.status(200).json(result.rows);
  });

  router.post("/", async (req, res) => {
    try {
      const data = await useractivitylog.GetInstance().create(req.body);
      res.json({data});
    } catch (error) {
      console.error(error);
    }
  });

  return router;
};
