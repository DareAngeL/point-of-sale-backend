const { Filter } = require("../model");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = specialRequestGroupEndpoints = () => {
  const specialrequestgroup = modelList.specialrequestgroup.instance;

  router.get("/", async (req, res) => {
    const filter = new Filter(req.query);
    const result = await specialrequestgroup.ReadMany(filter.Get());
    res.status(200).json(result.rows);
  });

  router.post("/", async (req, res) => {
    const { body } = req;

    const create = await specialrequestgroup.Create(body);
    res.status(200).json(create);
  });

  router.delete("/:modcde", async (req, res) => {
    const { modcde } = req.params;

    try {
      const deleted = await specialrequestgroup.GetInstance().destroy({
        where: {
          modcde: modcde,
        },
      }); 
      res.status(200).json(deleted);
    } catch (error) {
      console.error(error);
      res.status(500).json(undefined);
    }
  });

  return router;
};
