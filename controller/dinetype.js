const {
  paginate,
  onFilterPaginate,
  onSortPaginate,
  onSearch,
} = require("../helper/paginate/pagination");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = dinetypeEndpoints = () => {
  const dinetype = modelList.dinetype.instance;

  router.get("/", async (req, res) => {
    const { page, pageSize, filters, sort } = req.query;
    const dinetypeInst = dinetype.GetInstance();

    if (filters) {
      return res
        .status(200)
        .json(
          await onFilterPaginate(
            filters,
            dinetypeInst,
            page || 0,
            pageSize || 0
          )
        );
    }

    if (sort) {
      return res
        .status(200)
        .json(
          await onSortPaginate(sort, dinetypeInst, page || 0, pageSize || 0)
        );
    }

    const find = await dinetypeInst.findAll(
      paginate({}, { page: page || 0, pageSize: pageSize || "10" })
    );
    res.status(200).json(find);
  });

  router.get("/all", async (req, res) => {
    const find = await dinetype.GetInstance().findAll();

    res.status(200).json(find);
  });

  router.get("/:postypcde", async (req, res) => {
    const { postypcde } = req.params;
    const find = await dinetype.GetInstance().findOne({
      where: {
        postypcde: postypcde,
      },
    });

    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await dinetype.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const { searchTerm } = req.params;
    const { page, pageSize } = req.query;

    res
      .status(200)
      .json(
        await onSearch(
          searchTerm,
          "postypdsc",
          page || 0,
          pageSize || 0,
          dinetype.GetInstance()
        )
      );
  });

  router.put("/", async (req, res) => {
    const { recid } = req.body;

    const find = await dinetype.GetInstance().findOne({
      where: {
        postypdsc: req.body.postypdsc,
      },
    });

    if (find && find.recid !== recid) {
      const error = new Error("Duplicate Entries.");
      return res.status(409).json(error);
    }

    try {
      const update = await dinetype.CreateOrUpdate(
        { recid: recid },
        req.body,
        "dinetypenum",
        "postypcde"
      );
      res.status(200).json(update);
    } catch (error) {
      // if (error.original.code === "ER_DUP_ENTRY") {
      //   console.log("dito ba?");
      //   res.status(409).json(error);
      // } else {
      res.status(500).send(undefined);
      // }
    }
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const deleted = await dinetype.Delete({ recid: id });

    res.status(200).json(deleted);
  });

  return router;
};
