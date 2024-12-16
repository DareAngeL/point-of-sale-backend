const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = warehouseEndpoints = () => {
  const warehouse = modelList.warehouse.instance;

  router.get("/", async (req, res) => {
    const find = await warehouse.Read();
    res.status(200).json(find);
  });

  router.get("/join", async (req, res) => {
    const warehousedetail = modelList.warehousedetail.instance.GetInstance();
    const find = await warehouse
      .GetInstance()
      .findAll({ include: warehousedetail });

    res.status(200).json(find);
  });

  router.put("/", async (req, res) => {
    const { recid } = req.body;

    const update = await warehouse.CreateOrUpdate(
      { recid: recid },
      req.body,
      "warehousenum",
      "warcde"
    );
    res.status(200).json(update);
  });

  router.delete("/:warcde", async (req, res) => {
    const { warcde } = req.params;
    const deleted = await warehouse.Delete({ warcde: warcde });
    res.status(200).json(deleted);
  });

  //   router.delete("/:id", async (req, res) => {
  //     const { id } = req.params;

  //     const deleted = await warehouse.Delete({ recid: id });

  //     res.status(200).json(deleted);
  //   });

  return router;
};
