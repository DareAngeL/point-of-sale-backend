const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = cardtypeEndpoints = () => {
  const cardtype = modelList.cardtype.instance;

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const cardtypeInst = cardtype.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        cardtypeInst,
        page || 0,
        pageSize || 0,
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        cardtypeInst,
        page || 0,
        pageSize || 0,
      ))
    }

    const find = await cardtypeInst.findAll(
      paginate({}, {page: page || 0, pageSize: pageSize || "10"})
    )
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await cardtype.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "cardtype",
      page || 0,
      pageSize || 0,
      cardtype.GetInstance(),
    ));
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;
    try {
      const update = await cardtype.CreateOrUpdate({recid: recid}, req.body);
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

    const deleted = await cardtype.Delete({recid: id});

    res.status(200).json(deleted);
  });

  return router;
};
