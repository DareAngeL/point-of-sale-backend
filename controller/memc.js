const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const { Filter } = require("../model");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = memcEndpoints = () => {
  const memc = modelList.memc.instance;

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const memcInst = memc.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        memcInst,
        page || 0,
        pageSize || 0,
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        memcInst,
        page || 0,
        pageSize || 0,
      ))
    }

    const find = await memcInst.findAll(
      paginate({}, {page: page || 0, pageSize: pageSize || "10"})
    )
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await memc.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "codedsc",
      page || 0,
      pageSize || 0,
      memc.GetInstance(),
    ));
  });

  router.get("/filter", async (req, res) => {
    const filter = new Filter(req.query);

    const find = await memc.GetInstance().findOne({...filter.Get()});
    res.status(200).json(find);
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;
    try {
      const update = await memc.CreateOrUpdate(
        {recid: recid},
        req.body,
        "memcnum",
        "code"
      );
      res.status(200).json(update);
    } catch (error) {
      if (error.original.code === "ER_DUP_ENTRY") {
        console.log("dito ba?", error);
        res.status(409).json(error);
      } else {
        res.status(500).send(undefined);
      }
    }
  });

  router.delete("/:id", async (req, res) => {
    const {id} = req.params;

    const deleted = await memc.Delete({recid: id});

    res.status(200).json(deleted);
  });

  return router;
};
