const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = cashIOReasonEndpoints = () => {
  const cashIOReason = modelList.cashIOReason.instance;

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const cashIOReasonInst = cashIOReason.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        cashIOReasonInst,
        page || 0,
        pageSize || 0,
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        cashIOReasonInst,
        page || 0,
        pageSize || 0,
      ))
    }

    const find = await cashIOReasonInst.findAll(
      paginate({}, {page: page || 0, pageSize: pageSize || "10"})
    )
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await cashIOReason.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "cashioreason",
      page || 0,
      pageSize || 0,
      cashIOReason.GetInstance(),
    ));
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;

    const find = await cashIOReason.GetInstance().findOne({
      where: {
        cashioreason: req.body.cashioreason,
      },
    });

    if (find && !recid) {
      const error = new Error("Duplicate Entries.");
      return res.status(409).json(error);
    }

    console.log("pinasa", req.body);
    try {
      const update = await cashIOReason.CreateOrUpdate(
        {recid: recid},
        req.body
      );
      res.status(200).json(update);
    } catch (error) {
      if (error.original.code === "ER_DUP_ENTRY") {
        console.log("dito ba?");
        res.status(409).json(error);
      } else {
        res.status(500).send(undefined);
      }
    }
  });

  router.delete("/:id", async (req, res) => {
    const {id} = req.params;

    const deleted = await cashIOReason.Delete({recid: id});

    res.status(200).json(deleted);
  });

  return router;
};
