const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = terminalEndpoints = () => {
  const terminal = modelList.terminal.instance;

  router.get("/", async (req, res) => {
    const find = await terminal.Read();
    res.status(200).json(find);
  });

  router.put("/", async (req, res) => {
    try{
      const { recid } = req.body;
      console.log("par");
      const update = await terminal.CreateOrUpdate({ recid: recid }, req.body);
      res.status(200).json(update);

    }
    catch(e){
      res.status(400).json({Error : e.original.sqlMessage});
    }
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const find = await terminal.ReadOne(id);
    res.status(200).json(find);
  });

  router.post("/", async (req, res) => {
    try{
      
      const { body } = req;
      const create = await terminal.CreateOrUpdate(body);
      res.status(200).json(create);

    }
    catch(e){
      res.status(400).json({Error : e});
    }
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const deleted = await terminal.Delete({ recid: id });

    res.status(200).json(deleted);
  });

  return router;
};
