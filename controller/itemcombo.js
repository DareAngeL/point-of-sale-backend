const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = itemComboEndpoints = () => {
  const itemcombo = modelList.itemcombo.instance;

  router.get("/", async (req, res) => {
    const find = await itemcombo.Read();
    res.status(200).json(find);
  });

  router.put("/single", async (req, res) => {
    const {recid} = req.body;
    const updatedItem = await itemcombo.CreateOrUpdate(
      {recid: recid},
      req.body
    );

    const find = await itemcombo.Read();
    res.status(200).json(find);
  });

  router.put("/", async (req, res) => {
    try {
      const {itemCombos, itemsToDelete} = req.body;

      // update
      await Promise.all(
        itemCombos.map(async (update) => {
          const {recid} = update;

          const updatedItem = await itemcombo.CreateOrUpdate(
            {recid: recid},
            update,
            "combodocnum",
            "combodocnum"
          );
          return updatedItem;
        })
      );

      // delete
      //
      if (itemsToDelete.length > 0) {
        await Promise.all(
          itemsToDelete.map(async (update) => {
            const {recid} = update;
            const deleted = await itemcombo.Delete({recid: recid});
          })
        );
      }

      const find = await itemcombo.Read();
      res.status(200).json(find);
    } catch (error) {
      res.status(500).json({msg: "Server Error", error});
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const {id} = req.params;

      const deleted = await itemcombo.Delete({recid: id});
      res.status(200).json(deleted);
    } catch (error) {
      res.status(500).json({msg: "Server Error"});
    }
  });

  return router;
};
