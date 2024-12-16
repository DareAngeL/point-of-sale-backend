const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = warehousedetailEndpoints = () => {
  const warehousedetail = modelList.warehousedetail.instance;

  router.get("/", async (req, res) => {
    const find = await warehousedetail.Read();
    res.status(200).json(find);
  });

  router.put("/:warcde", async (req, res) => {
    const { warcde } = req.params;
    const data = req.body;

    const result = await warehousedetail.GetInstance().bulkCreate(
      data, { updateOnDuplicate: ['postypcde', 'prccde', 'is_active'] }
    )

    res.status(200).json(result.map(d => d.dataValues));
  });

  router.put("/", async (req, res) => {
    const { recid } = req.body;

    const update = await warehousedetail.CreateOrUpdate(
      { recid: recid },
      req.body
    );
    res.status(200).json(update);
  });

  router.delete("/:warcde", async (req, res) => {
    const { warcde } = req.params;
    const deleted = await warehousedetail.Delete({ warcde: warcde });
    res.status(200).json(deleted);
  });

  // router.delete("/:id", async (req, res) => {
  //   const { id } = req.params;
  //   const deleted = await warehousedetail.Delete({ recid: id });
  //   res.status(200).json(deleted);
  // });

  return router;
};
