const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = taxcodeEndpoints = () => {
  const taxcode = modelList.taxcode.instance;

  router.get("/", async (req, res) => {
    const find = await taxcode.Read();
    res.status(200).json(find);
  });

  router.put("/", async (req, res) => {
    const { recid } = req.body;

    const update = await taxcode.CreateOrUpdate({ recid: recid }, req.body);
    res.status(200).json(update);
  });

  return router;
};
