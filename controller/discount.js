const {
  onFilterPaginate,
  onSortPaginate,
  paginate,
  onSearch,
} = require("../helper/paginate/pagination");
const {Filter} = require("../model");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = discountEndpoints = () => {
  const discount = modelList.discount.instance;

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const discountInst = discount.GetInstance();

    if (filters) {
      return res
        .status(200)
        .json(
          await onFilterPaginate(
            filters,
            discountInst,
            page || 0,
            pageSize || 0
          )
        );
    }

    if (sort) {
      return res
        .status(200)
        .json(
          await onSortPaginate(sort, discountInst, page || 0, pageSize || 0)
        );
    }

    const find = await discountInst.findAll(
      paginate({}, {page: page || 0, pageSize: pageSize || "10"})
    );

    res.status(200).json(find);
  });
  
  router.get("/all", async (req, res) => {
    const find = await discount.GetInstance().findAll();
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await discount.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res
      .status(200)
      .json(
        await onSearch(
          searchTerm,
          "disdsc",
          page || 0,
          pageSize || 0,
          discount.GetInstance()
        )
      );
  });

  router.get("/filter", async (req, res) => {
    const {page, pageSize, ...otherQuery} = req.query;
    const filter = new Filter(otherQuery);
    const discountInstance = discount.GetInstance();
    let find;

    const where = {...filter.Get()};

    if (!where.where) {
      find = await discountInstance.findAll(
        paginate({}, {page: page || 0, pageSize: pageSize || "10"})
      );

      return res.status(200).json(find);
    }

    for (const keys of Object.keys(where.where)) {
      const value = where.where[keys];
      let symbols = Object.getOwnPropertySymbols(value);
      let value2 = value[symbols[0]];

      if (value2 === "undefined") {
        delete where.where[keys];
      }
    }

    find = await discountInstance.findAll(
      paginate(
        {
          ...where,
        },
        {page: page || 0, pageSize: pageSize || "10"}
      )
    );

    res.status(200).json(find);
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;

    const find = await discount.GetInstance().findOne({
      where: {
        disdsc: req.body.disdsc,
      },
    });

    if (find && !recid) {
      const error = new Error("Duplicate Entries.");
      return res.status(409).json(error);
    }

    try {
      const update = await discount.CreateOrUpdate({recid: recid}, req.body);
      res.status(200).json(update);
    } catch (error) {
      console.log("pucha", error);
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

    const deleted = await discount.Delete({recid: id});

    res.status(200).json(deleted);
  });

  function getDiscountConfig(discountType) {
    switch (discountType) {
      case "Senior":
        return {
          discde: "Senior",
          disdsc: "Senior",
          disper: 20,
          disamt: 0,
          distyp: "Percent",
          exemptvat: "Y",
          nolessvat: 1,
          govdisc: 1,
          scharge: 1,
          online_deals: 0,
        };
      case "PWD":
        return {
          discde: "PWD",
          disdsc: "PWD",
          disper: 20,
          disamt: 0,
          distyp: "Percent",
          exemptvat: "Y",
          nolessvat: 1,
          govdisc: 1,
          scharge: 1,
          online_deals: 0,
        };
      case "Athlete":
        return {
          discde: "Athlete",
          disdsc: "Athlete",
          disper: 20,
          disamt: 0,
          distyp: "Percent",
          exemptvat: "N",
          nolessvat: 1,
          govdisc: 1,
          scharge: 1,
          online_deals: 0,
        };
      case "MOV":
        return {
          discde: "MOV",
          disdsc: "MOV",
          disper: 20,
          disamt: 0,
          distyp: "Percent",
          exemptvat: "N",
          nolessvat: 0,
          govdisc: 1,
          scharge: 0,
          online_deals: 0,
        };
      case "Diplomat":
        return {
          discde: "Diplomat",
          disdsc: "Diplomat",
          disper: 0,
          disamt: 0,
          distyp: "Percent",
          exemptvat: "Y",
          nolessvat: 0,
          govdisc: 1,
          scharge: 0,
          online_deals: 0,
        };
      default:
        return {};
    }
  }
  router.get("/checkGovernment", async (req, res) => {
    res.send(undefined);
    // const discountsToCheck = ["Senior", "Athlete", "MOV", "Diplomat", "PWD"];

    // const find = await discount.GetInstance().findAll({
    //   where: {
    //     disdsc: discountsToCheck,
    //   },
    // });
    // const existingDiscounts = find.map((entry) => entry.disdsc);
    // const missingDiscounts = discountsToCheck.filter(
    //   (discount) => !existingDiscounts.includes(discount)
    // );
    // if (missingDiscounts.length > 0) {
    //   for (const missingDiscount of missingDiscounts) {
    //     const discountConfig = getDiscountConfig(missingDiscount);
    //     await discount.Create(discountConfig);
    //   }
    //   return res
    //     .status(200)
    //     .json({msg: "Created Missing Required Discounts", missingDiscounts});
    // }

    // res.status(200).json({msg: "All required Discounts are here."});
  });

  return router;
};
