const {modelList} = require("../model/model");
const express = require("express");
const { onFilterPaginate, onSortPaginate, fixPricelist, onSearchPaginate } = require("../helper/paginate/pricelist_pagination");
const { paginate } = require("../helper/paginate/pagination");
const { Filter } = require("../model");
const { dateTodayFormatter } = require("../helper");
const { Op } = require("sequelize");
const router = express.Router();

module.exports = pricelistEndpoints = () => {
  const pricelist = modelList.pricelist.instance;

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const dineTypeInst = modelList.dinetype.instance.GetInstance();
    const pricelistInst = pricelist.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        page || 0,
        pageSize || 0,
        dineTypeInst,
        pricelistInst,
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        page || 0,
        pageSize || 0,
        dineTypeInst,
        pricelistInst,
      ))
    }

    // let find = await pricelistInst.findAll(
    //   paginate({
    //     where: {
    //       prcdte: {
    //         [Op.or]: [
    //           null, 
    //           {[Op.lte]: dateTodayFormatter()}
    //         ],
    //       }
    //     },
    //     group: ["prccde"],
    //     order: [["recid", "DESC"]],
    //   }, {page: page || 0, pageSize: pageSize || "10"})
    // )
    const find = await fixPricelist({}, pricelistInst, page, pageSize);
    
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await pricelist.GetInstance().count({
      where: {
        prcdte: {
          [Op.or]: [
            null, 
            {[Op.lte]: dateTodayFormatter()}
          ],
        }
      },
      group: ["prccde"],
      order: [["recid", "ASC"]],
    });
    
    const rows = Math.ceil(count.length / req.query.pageSize)*1;
    console.log(rows);
    
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    let searched = await onSearchPaginate(
      searchTerm,
      "prcdsc",
      page || 0,
      pageSize || 0,
      pricelist.GetInstance(),
      // {
      //   prcdte: {
      //     [Op.or]: [
      //       null, 
      //       {[Op.lte]: dateTodayFormatter()}
      //     ],
      //   }
      // }
    );
   
    res.status(200).json(searched);
  });

  router.get("/filter", async (req, res) => {
    const {include, ...otherQuery} = req.query;
    const filter = new Filter(otherQuery);
    const pricedetail = modelList.pricedetail.instance.GetInstance();

    let result = await fixPricelist(filter.Get().where, pricelist.GetInstance());
    if (include) {
      result = await Promise.all(result.map(async r => {
        const _r = r.dataValues;
        const pricedetailItems = await pricedetail.findAll({
          where: {
            prccde: _r.prccde,
            prcdte: _r.prcdte,
          },
          raw: true,
        });
  
        return {
          ..._r,
          pricecodefile2s: pricedetailItems,
        }
      }));
    }

    res.status(200).json(result);
  });

  router.get("/join", async (req, res) => {
    const pricedetail = modelList.pricedetail.instance.GetInstance();
    let result = await fixPricelist({}, pricelist.GetInstance());
    
    result = await Promise.all(result.map(async r => {
      const _r = r.dataValues;
      
      const pricedetailItems = await pricedetail.findAll({
        where: {
          prccde: _r.prccde,
          prcdte: _r.prcdte,
        },
        raw: true,
      });

      return {
        ..._r,
        pricecodefile2s: pricedetailItems,
      }
    }));

    res.status(200).json(result);
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;
    const find = await pricelist.GetInstance().findOne({
      where: {
        prcdsc: req.body.prcdsc,
      },
    });

    if (find && find.recid !== recid) {
      const error = new Error("Duplicate Entries.");
      return res.status(409).json(error);
    }

    try {
      const update = await pricelist.CreateOrUpdate(
        {recid: recid},
        req.body,
        "pricelistnum",
        "prccde"
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

  router.delete("/:id", async (req, res) => {    const pricedetail = modelList.pricedetail.instance.GetInstance();
    const {id} = req.params;

    const deleted = await pricelist.Delete({recid: id});
    await pricedetail.destroy({where: {prccde: deleted.prccde}});

    res.status(200).json(deleted);
  });

  return router;
};
