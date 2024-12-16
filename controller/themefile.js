const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = themeEndpoints = () => {
  const themefile = modelList.themefile.instance;

  router.get("/", async (req, res) => {
    try {
      const result = await themefile.Read();
      res.status(200).json(result[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  });

  router.put("/", async (req, res) => {
    try {
      const result = await themefile.CreateOrUpdate({recid: req.body.recid || undefined}, req.body);
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  });

  return router;
}