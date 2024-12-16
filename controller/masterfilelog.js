const express = require("express");
const router = express.Router();
const { modelList } = require("../model/model");

module.exports = masterFileLogEndPoints = () => {
  const masterfilelog = modelList.masterfilelog.instance;

  router.get("/", async (req, res) => {
    const find = await masterfilelog.Read();
    res.status(200).json(find);
  });

  return router;
};
