const { _log } = require("../helper");
const { onFilterPaginate, onSortPaginate } = require("../helper/paginate/itemsubclass_pagination");
const { paginate, onSearch } = require("../helper/paginate/pagination");
const { Filter } = require("../model");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = itemsubclassificationEndpoints = () => {
  const itemsubclassification = modelList.itemsubclassification.instance;
  const itemclassification = modelList.itemclassification.instance.GetInstance();
  const item = modelList.item.instance.GetInstance();

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const itemclassInst = modelList.itemclassification.instance.GetInstance();
    const itemsubclassificationInst = itemsubclassification.GetInstance();

    console.log("aray ko naman");

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        page || 0,
        pageSize || 0,
        itemclassInst,
        itemsubclassificationInst,
      ));
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        page || 0,
        pageSize || 0,
        itemclassInst,
        itemsubclassificationInst,
      ));
    }

    const find = await itemsubclassificationInst.findAll(
      paginate({include: [{model: itemclassification}, {model: item}]}, {page: page || 0, pageSize: pageSize || "10"})
    )

    res.status(200).json(find);
  });

  router.get("/all", async (req, res) => {
    const find = await itemsubclassification.Read();
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await itemsubclassification.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });
  
  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "itemsubclassdsc",
      page || 0,
      pageSize || 0,
      itemsubclassification.GetInstance(),
      undefined,
      {include: itemclassification},
    ));
  });

  router.get("/subclass/:itmclacde", async (req, res) => {
    const {itmclacde} = req.params;
    // const {page, pageSize} = req.query;

    const find = await itemsubclassification.GetInstance().findAll({
      where: {
        itmclacde: itmclacde,
        hide_subclass: 0
      },
      order: [
        ["recid", "DESC"]
      ]
    })
    //   paginate({
    //     where: {
    //       itmclacde: itmclacde,
    //       hide_subclass: 0
    //     },
    //   }, {page: page, pageSize: pageSize})
    // );

    res.status(200).json(find);
  });

  router.get("/filter/search", async (req, res) => {
    const {page, pageSize, ...otherQuery } = req.query;
    const filter = new Filter(otherQuery);
    const itemsubclassificationInst = itemsubclassification.GetInstance();
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

    find = await itemsubclassificationInst.findAndCountAll(
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
    const {page, pageSize, ...otherQuery} = req.query;
    const filter = new Filter(otherQuery);

    const where = {...filter.Get()};

    if (!where.where) {
      const find = await itemsubclassification.GetInstance().findAll(
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

    const find = await itemsubclassification.GetInstance().findAll(
      paginate({
        ...where,
      }, {page: page, pageSize: pageSize})
    );

    res.status(200).json(find);
  });

  router.get("/join", async (req, res) => {
    const item = modelList.item.instance.GetInstance();
    const find = await itemsubclassification
      .GetInstance()
      .findAll({include: item});

    res.status(200).json(find);
  });

  router.post("/", async (req, res) => {
    const {body} = req;
    try {
      const create = await itemsubclassification.CreateOrUpdate(body);
      res.status(200).json(create);
    } catch (error) {
      res.status(409).json(error);
    }
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;
    console.log("pinasa", req.body);

    try {
      const update = await itemsubclassification.CreateOrUpdate(
        {recid: recid},
        req.body,
        "itmsubclanum",
        "itemsubclasscde",
        "locationcde"
      );

      const data = await itemsubclassification.GetInstance()
        .findOne({
          where: {
            recid: update.recid
          },
          include: [itemclassification, item]
        })
     
      // if (req.body.locationcde) {
      //   await item.update(
      //     {
      //       locationcde: req.body.locationcde,
      //     },
      //     {
      //       where: {
      //         itemsubclasscde: req.body.itemsubclasscde,
      //       },
      //     }
      //   );
      // }

      res.status(200).json(data);
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
          const updatedItem = await itemsubclassification.CreateOrUpdate(
            {recid: recid},
            {locationcde: printerName},
            "itmsubclanum",
            "itemsubclasscde",
            "locationcde"
          );
          const data = await itemsubclassification.GetInstance()
            .findOne({
              where: {
                recid: updatedItem.recid
              },
              include: [itemclassification, item]
            })

          if (updatedItem.locationcde) {
            await item.update(
              {
                locationcde: updatedItem.locationcde,
              },
              {
                where: {
                  itemsubclasscde: updatedItem.itemsubclasscde,
                },
              }
            );
          }

          return data;
        })
      );

      res.status(200).json(updatedItems);
    } catch (error) {
      console.error("Error updating items:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });

  router.delete("/:id", async (req, res) => {
    const {id} = req.params;

    const deleted = await itemsubclassification.Delete({recid: id});

    res.status(200).json(deleted);
  });

  return router;
};
