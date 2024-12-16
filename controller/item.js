const {paginate, onSearch} = require("../helper/paginate/pagination");
const {modelList} = require("../model/model");
const express = require("express");
const {
  onFilterPaginate,
  onSortPaginate,
} = require("../helper/paginate/item_pagination");
const {literal, Op} = require("sequelize");
const {_log, dateTodayFormatter} = require("../helper");
const {Filter} = require("../model");
const router = express.Router();

module.exports = itemEndpoints = () => {
  const item = modelList.item.instance;
  const itemclass = modelList.itemclassification.instance;
  const itemsubclass = modelList.itemsubclassification.instance;

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const itemInstance = item.GetInstance();
    const itemclassInstance = itemclass.GetInstance();
    const itemsubclassInstance = itemsubclass.GetInstance();

    if (filters) {
      return res
        .status(200)
        .json(
          await onFilterPaginate(
            filters,
            page || 0,
            pageSize || 0,
            itemInstance,
            itemclassInstance,
            itemsubclassInstance
          )
        );
    }

    if (sort) {
      return res
        .status(200)
        .json(
          await onSortPaginate(
            sort,
            page || 0,
            pageSize || 0,
            itemInstance,
            itemclassInstance,
            itemsubclassInstance
          )
        );
    }

    const find = await itemInstance.findAll(
      paginate({}, {page: page || 0, pageSize: pageSize || "10"})
    );

    res.status(200).json(find);
  });

  router.get("/all", async (req,res) =>{
    const itemInstance = item.GetInstance();

    const findAll = await itemInstance.findAll({})

    res.status(200).json(findAll);

  })

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res
      .status(200)
      .json(
        await onSearch(
          searchTerm,
          "itmdsc",
          page || 0,
          pageSize || 0,
          item.GetInstance()
        )
      );
  });

  router.get("/rows", async (req, res) => {
    const count = await item.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  // use to check if the barcode exists or not before adding or editing data
  router.get("/check_barcde/:recid", async (req, res) => {
    const { recid } = req.params;
    const { barcde } = req.query;

    if (!barcde || barcde === '') {
      return res.status(200).json({isExist: false});
    }

    const findItem = await item.GetInstance()
      .findOne({
        where: {
          barcde: barcde
        }
      });

    if (!findItem) {
      return res.status(200).json({isExist: false});
    }

    _log(`${typeof recid}, ${typeof findItem.recid}`);

    // if the found item's recid is the same as the recid param
    // it means there's no other items who owns the barcode, 
    // only the recid that was passed in the params who owns the barcode.
    // we return false to tell the frontend that he can proceed
    // on updating the item's data.
    if (findItem.recid === parseInt(recid)) {
      return res.status(200).json({isExist: false});
    }

    res.status(200).json({isExist: true});
  });

  router.get("/filter/search", async (req, res) => {
    const {page, pageSize, ...otherQuery} = req.query;
    const filter = new Filter(otherQuery);
    const itemInstance = item.GetInstance();
    let find;

    const where = {...filter.Get()};

    for (const keys of Object.keys(where.where)) {
      const value = where.where[keys];
      let symbols = Object.getOwnPropertySymbols(value);
      let value2 = value[symbols[0]];

      if (value2 === "undefined") {
        delete where.where[keys];
      }
    }

    find = await itemInstance.findAndCountAll(
      paginate(
        {
          ...where,
        },
        {page: page || 0, pageSize: pageSize || "10"}
      )
    );

    _log(find.count);

    res.status(200).json({
      rows: find.rows,
      count: find.count,
    });
  });

  router.get("/filter", async (req, res) => {
    const {page, pageSize, ...otherQuery} = req.query;
    const filter = new Filter(otherQuery);
    const itemInstance = item.GetInstance();
    let find;

    const where = {...filter.Get()};

    if (!where.where) {
      find = await itemInstance.findAll(
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

    find = await itemInstance.findAll(
      paginate(
        {
          ...where,
        },
        {page: page || 0, pageSize: pageSize || "10"}
      )
    );

    res.status(200).json(find);
  });
  // used in itemWidget
  router.get("/items/:itmsubclacde/:prccde/:searchTerm", async (req, res) => {
    const {itmsubclacde, prccde, searchTerm} = req.params;
    const {page, pageSize} = req.query;
    const pricedetailInst = modelList.pricedetail.instance.GetInstance();

    let findItems = await item.GetInstance().findAll(
      paginate(
        {
          where: {
            itemsubclasscde: itmsubclacde,
            ...(searchTerm !== "undefined" && {
              itmdsc: {
                [Op.like]: "%" + searchTerm + "%",
              },
            }),
            itmcde: {
              [Op.in]: literal(
                `(SELECT itmcde FROM ${pricedetailInst.tableName} WHERE prccde="${prccde}")`
              ),
            },
          },
          raw: true,
        },
        {page: page || 0, pageSize: pageSize || "10"}
      )
    );

    const itmcodes = findItems.map((d) => d.itmcde);
    
    let pricedetail;
    const hasNoPrcdte = await pricedetailInst.findOne({
      where: {
        prcdte: null,
        prccde: prccde
      }
    });

    if (hasNoPrcdte) {
      pricedetail = await pricedetailInst.findAll({
        where: {
          itmcde: {
            [Op.in]: itmcodes,
          },
          prccde: prccde,
        },
      });
    }
    else {
      pricedetail = await pricedetailInst.findAll({
        where: {
          itmcde: {
            [Op.in]: itmcodes,
          },
          prcdte: {
            [Op.or]: [
              { [Op.is]: null },
              { [Op.lte]: dateTodayFormatter() }
            ]
          },
          [Op.and]: [
            literal(`
              (SELECT MAX(prcdte) FROM pricecodefile2 AS t2
              WHERE t2.prccde = '${prccde}'
              AND t2.prcdte <= '${dateTodayFormatter()}') = pricecodefile2.prcdte
            `)
          ]
        },
      });
    }

    findItems = findItems.map((d) => {

      const activePrice = pricedetail.find((p) => p.itmcde === d.itmcde);

      return {
        ...d,
        grossprc: activePrice?.untprc,
        groprc: activePrice?.untprc,
        groext: activePrice?.untprc,
        extprc: activePrice?.untprc,
      };
    });

    res.status(200).json(findItems);
  });

  // get single item
  router.get("/:itemcde", async (req, res) => {
    const {itemcde} = req.params;
    const find = await item.GetInstance().findOne({
      where: {
        itmcde: itemcde,
      },
    });

    res.status(200).json(find);
  });

  router.post("/", async (req, res) => {
    const {body} = req;
    const create = await item.CreateOrUpdate(body);
    res.status(200).json(create);
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;
    const _item = item.GetInstance();

    let data = {...req.body};

    const find = await item.GetInstance().findOne({
      where: {
        itmdsc: req.body.itmdsc,
      },
    });

    if (find && !recid) {
      const error = new Error("Duplicate Entries.");
      return res.status(409).json(error);
    }

    try {
      //#region CHANGING LOCATION CODE (PRINTER STATION)
      if (recid) {
        const itm = await _item.findOne({
          where: {
            recid: recid,
          },
          attributes: ["itmclacde", "itemsubclasscde"],
        });

        await updateLocCode(itm, data);
      } else {
        await updateLocCode(data, data, true);
      }
      //#endregion

      const update = await item.CreateOrUpdate(
        {recid: recid},
        data,
        "itmcdedocnum",
        "itmcde"
      );
      
      // UPDATE THE ITEM IN THE PRICELIST ALSO
      if (recid) {
        const pricedetail = modelList.pricedetail.instance.GetInstance();
        const itemcde = update.itmcde;

        await pricedetail.update(
          {itmdsc: update.itmdsc},
          {
            where: {
              itmcde: itemcde,
            },
          }
        );

        // ALSO TRY TO UPDATE THE ITEMCOMBO FILE IF THE ITEM WAS ADDED AS A COMBO ITEM
        const itemcombo = modelList.itemcombo.instance.GetInstance();
        const findItemCombo = await itemcombo.findOne({
          where: {
            itmcde: itemcde,
          },
        });

        if (findItemCombo) {
          await itemcombo.update(
            {itmdsc: update.itmdsc},
            {
              where: {
                itmcde: itemcde,
              },
            }
          );
        }
      }

      res.status(200).json(update);
    } catch (error) {
      if (error.original && error.original.code === "ER_DUP_ENTRY") {
        console.log("dito ba?", error);
        res.status(409).json(error);
      } else {
        console.log(error);
        res.status(500).send(undefined);
      }
    }
  });

  router.put("/bulk", async (req, res) => {
    const {items, printerName} = req.body;
    try {
      const updatedItems = await Promise.all(
        items.map(async (update) => {
          const {recid} = update;
          const updatedItem = await item.CreateOrUpdate(
            {recid: recid},
            {locationcde: printerName},
            "locationcde"
          );
          return updatedItem;
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

    const deleted = await item.Delete({recid: id});

    res.status(200).json(deleted);
  });

  router.get("/barcode/:barcde/:prccde", async (req, res) => {

    try {

      const {barcde, prccde} = req.params;
      const itemModel = item.GetInstance();
      const priceDetailModel = modelList.pricedetail.instance.GetInstance();

      const findItem = await itemModel.findOne({where : {barcde: barcde}, raw: true});
      const findPriceDetail = await priceDetailModel.findOne({where : {itmcde: findItem.itmcde, prccde: prccde}, raw: true})

      console.log("PRICE DETAILLLL!!!!", findItem);

      const returnObj = {
        ...findPriceDetail,
        grossprc: findPriceDetail.untprc,
        groprc: findPriceDetail.untprc,
        groext: findPriceDetail.untprc,
        extprc: findPriceDetail.untprc,
        taxcde: findItem.taxcde
      }

      res.status(200).json(returnObj);
      
    } catch (error) {
      
      res.status(400).json(error);
    }
  });

  const updateLocCode = async (itm, data, forceUpdate) => {
    const itemclassification =
      modelList.itemclassification.instance.GetInstance();
    const itemsubclassification =
      modelList.itemsubclassification.instance.GetInstance();
    const systemparameters = modelList.systemparameters.instance.GetInstance();
    const syspar = await systemparameters.findOne({});

    if (
      syspar.allow_printerstation === 1 &&
      syspar.itemclass_printer_station_tag === 1
    ) {
      if ((itm && itm.itmclacde !== data.itmclacde) || forceUpdate) {
        // if the itemclass was changed, update the locationcde for this item.
        const itmclass = await itemclassification.findOne({
          where: {
            itmclacde: data.itmclacde,
          },
          attributes: ["locationcde"],
        });

        data.locationcde = itmclass.locationcde;
      }
    } else if (
      syspar.allow_printerstation === 1 &&
      syspar.itemsubclass_printer_station_tag === 1
    ) {
      if (
        (itm && itm.itemsubclasscde !== data.itemsubclasscde) ||
        forceUpdate
      ) {
        // if the itemsubclass was changed, update the locationcde for this item.
        const itmsubclass = await itemsubclassification.findOne({
          where: {
            itemsubclasscde: data.itemsubclasscde,
          },
          attributes: ["locationcde"],
        });

        data.locationcde = itmsubclass.locationcde;
      }
    }
  };

  return router;
};
