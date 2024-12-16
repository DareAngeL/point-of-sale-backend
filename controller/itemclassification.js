const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const { Filter } = require("../model");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = itemclassificationEndpoints = () => {
  const itemclassification = modelList.itemclassification.instance;
  const item = modelList.item.instance.GetInstance();

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const itmclassInstance = itemclassification.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        itmclassInstance,
        page || 0,
        pageSize || 0,
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        itmclassInstance,
        page || 0,
        pageSize || 0,
      ))
    }

    const find = await itmclassInstance.findAll(
      paginate({}, {page: page || 0, pageSize: pageSize || "10"})
    )

    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await itemclassification.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  })

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "itmcladsc",
      page || 0,
      pageSize || 0,
      itemclassification.GetInstance(),
    ));
  });

  router.get("/filter/search", async (req, res) => {
    const {page, pageSize, ...otherQuery } = req.query;
    const filter = new Filter(otherQuery);
    const itemclassificationInst = itemclassification.GetInstance();
    let find;

    const where = {...filter.Get()};

    for (const keys of Object.keys(where.where)) {
      const value = where.where[keys];
      let symbols = Object.getOwnPropertySymbols(value);
      let value2 = value[symbols[0]];

      if (value2 === 'undefined') {
        delete where.where[keys];
      }
    }

    find = await itemclassificationInst.findAndCountAll(
      paginate({
        ...where
      }, {page: page || 0, pageSize: pageSize || "10"})
    );

    res.status(200).json({
      rows: find.rows,
      count: find.count
    });
  })

  router.get("/filter", async (req, res) => {
    const {page, pageSize, ...otherQuery } = req.query;
    const filter = new Filter(otherQuery);
    const itemclassificationInst = itemclassification.GetInstance();
    let find;

    const where = {...filter.Get()};

    if (!where.where) {
      find = await itemclassificationInst.findAll(
        paginate({}, {page: page || 0, pageSize: pageSize || "10"})
      );
  
      return res.status(200).json(find);
    }

    for (const keys of Object.keys(where.where)) {
      const value = where.where[keys];
      let symbols = Object.getOwnPropertySymbols(value);
      let value2 = value[symbols[0]];

      if (value2 === 'undefined') {
        delete where.where[keys];
      }
    }

    find = await itemclassificationInst.findAll(
      paginate({
        ...where
      }, {page: page || 0, pageSize: pageSize || "10"})
    );

    res.status(200).json(find);
  });

  router.get("/join", async (req, res) => {
    const itemsubclassification =
      modelList.itemsubclassification.instance.GetInstance();

    const find = await itemclassification
      .GetInstance()
      .findAll({
        where: {
          inactive_class: 0,
        },
        include: itemsubclassification, order: [["recid", "DESC"]]
      });

    res.status(200).json(find);
  });

  router.get("/:id", async (req, res) => {
    const itemsubclassification =
      modelList.itemsubclassification.instance.GetInstance();
    const {id} = req.params;

    const find = await itemclassification
      .GetInstance()
      .findOne({where: {recid: id}, include: itemsubclassification});

    res.status(200).json(find);
  });

  router.delete("/:id", async (req, res) => {
    const {id} = req.params;

    const deleted = await itemclassification.Delete({recid: id});

    res.status(200).json(deleted);
  });

  router.post("/", async (req, res) => {
    const {body} = req;

    try {
      const create = await itemclassification.CreateOrUpdate(body);
      res.status(200).json(create);
    } catch (error) {
      res.status(409).json(error);
    }
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;

    try {
      const update = await itemclassification.CreateOrUpdate(
        {recid: recid},
        req.body,
        "itmclanum",
        "itmclacde",
        "locationcde"
      );

      // if (req.body.locationcde) {
      //   await item.update(
      //     {
      //       locationcde: req.body.locationcde,
      //     },
      //     {
      //       where: {
      //         itmclacde: req.body.itmclacde,
      //       },
      //     }
      //   );
      // }

      console.log(update);
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

  router.put("/bulk", async (req, res) => {
    const {itemClass, printerName} = req.body;

    try {
      const updatedItems = await Promise.all(
        itemClass.map(async (update) => {
          const {recid} = update;

          const updatedItem = await itemclassification.CreateOrUpdate(
            {recid: recid},
            {locationcde: printerName},
            "locationcde"
          );

          // if (updatedItem.locationcde) {
          //   await item.update(
          //     {
          //       locationcde: updatedItem.locationcde,
          //     },
          //     {
          //       where: {
          //         itmclacde: updatedItem.itmclacde,
          //       },
          //     }
          //   );
          // }

          return updatedItem;
        })
      );

      res.status(200).json(updatedItems);
    } catch (error) {
      console.error("Error updating items:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });

  return router;
};
