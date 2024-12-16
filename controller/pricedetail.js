const { Op, literal } = require("sequelize");
const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const { Filter } = require("../model");
const { modelList } = require("../model/model");
const express = require("express");
const { dateFormatter, dateTodayFormatter } = require("../helper");
const ExcelJS = require('exceljs');
const multer = require("multer");
const file = multer({});
const { sendMsg } = require('../socket/index');
const router = express.Router();

module.exports = pricedetailEndpoints = () => {
  const pricedetail = modelList.pricedetail.instance;
  const pricedetailInstance = pricedetail.GetInstance();

  router.get("/", async (req, res) => {
    const { page, pageSize, filters, sort, prccde } = req.query;
    let find;
  
    const hasNoPrcdte = await pricedetailInstance.findOne({
      where: {
        prcdte: null,
        prccde: prccde
      }
    });

    let whereClause;
    if (hasNoPrcdte) {
      whereClause = {
        prccde: prccde
      }
    } else {
      whereClause = {
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
        ],
      }
    }

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        pricedetailInstance,
        page || 0,
        pageSize || 0,
        whereClause
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        pricedetailInstance,
        page || 0,
        pageSize || 0,
        whereClause
      ))
    }

    find = await removeOldPrclstQuery(paginate({
        where: {
          prccde: prccde
        }
      }, {page: page || 0, pageSize: pageSize || "10"}), 
      prccde, 
      page,
      pageSize
    );

    res.status(200).json(find);
  });

  router.get("/load_items/:prccde", async (req, res) => {
    const { page, pageSize } = req.query;
    const { prccde } = req.params;
    const itemsInstance = modelList.item.instance.GetInstance();

    const findPDetails = await removeOldPrclstQuery({
      where: {
        prccde: prccde
      },
      attributes: ["itmcde"],
      raw: true
    }, prccde);

    const mappedPDetails = findPDetails.map((pdetail) => pdetail.itmcde);
    const findItems = await itemsInstance.findAndCountAll(
      paginate({
        where: {
          itmcde: {
            [Op.notIn]: mappedPDetails
          }
        }
      }, {
        page: page || 0, pageSize: pageSize || 10
      })
    );

    res.status(200).json({
      items: findItems.rows,
      rows: Math.ceil(findItems.count / pageSize)
    });
  });

  router.get("/load_addons/:prccde", async (req, res) => {
    const { page, pageSize } = req.query;
    const { prccde } = req.params;
    const itemsInstance = modelList.item.instance.GetInstance();

    const findPDetails = await removeOldPrclstQuery({
      where: {
        prccde: prccde
      },
      attributes: ["itmcde"],
      raw: true
    }, prccde);

    const mappedPDetails = findPDetails.map((pdetail) => pdetail.itmcde);
    const findAddons = await itemsInstance.findAll(
      paginate({
        where: {
          itmcde: {
            [Op.in]: mappedPDetails
          },
          isaddon: 1
        }
      }, {
        page: page || 0, pageSize: pageSize || 10
      })
    );

    res.status(200).json(findAddons);
  });

  router.get("/rows", async (req, res) => {
    const { prccde } = req.query;
    let count;
    const hasNoPrcdte = await pricedetailInstance.findOne({
      where: {
        prcdte: null,
        prccde: prccde
      }
    });

    if (hasNoPrcdte) {
      count = await pricedetailInstance.count({
        where: {
          prcdte: null,
          prccde: prccde
        }
      });
    }
    else {
      count = await pricedetailInstance.count({
        where: {
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
        }
      });
    }

    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize, prccde} = req.query;

    const hasNoPrcdte = await pricedetailInstance.findOne({
      where: {
        prcdte: null,
        prccde: prccde
      }
    });

    let find;
    if (hasNoPrcdte) {
      find = await onSearch(
        searchTerm,
        "itmdsc",
        page || 0,
        pageSize || 0,
        pricedetail.GetInstance(),
        {
          prccde: prccde,
        },
      )
    }
    else {
      find = await onSearch(
        searchTerm,
        "itmdsc",
        page || 0,
        pageSize || 0,
        pricedetail.GetInstance(),
        {
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
      );
    }
    
    res.status(200).json(find);
  });

  router.get("/ordering/search/:itmdsc/:prccde", async (req, res) => {
    const {itmdsc, prccde} = req.params;
    const itemInstance = modelList.item.instance.GetInstance();
    const itemSubclassInstance = modelList.itemsubclassification.instance.GetInstance();

    const find = await removeOldPrclstQuery({
        where: {
          itmdsc: {
            [Op.like]: '%' + itmdsc + '%'
          },
          prccde: prccde
        }
      },
      prccde, undefined, undefined, true
    );

    const itmcdes = find.map((item) => item.itmcde);
    // find the itemclassification and subclassification of the find
    const findItem = await itemInstance.findAll({
      where: {
        itmcde: {
          [Op.in]: itmcdes
        },
      },
      attributes: ["itmdsc", "itemsubclasscde"],
    });

    const subclasses = [];
    for (const item of findItem) {
      if (subclasses.includes(item.itemsubclasscde)) continue;

      subclasses.push(item.itemsubclasscde);
    }

    // get the itmclacde from itemSubclassInstance
    const findItemSubCla = await itemSubclassInstance.findAll({
      where: {
        itemsubclasscde: {
          [Op.in]: subclasses
        },
        hide_subclass: 0
      },
      attributes: ["itmclacde", "itemsubclasscde"],
    });

    const searched = {}
    for (const d of findItemSubCla) {
      if (searched[d.itmclacde]) {
        searched[d.itmclacde].push({
          subclass: d.itemsubclasscde,
        });
      } else {
        searched[d.itmclacde] = [{
          subclass: d.itemsubclasscde,
        }];
      }
    }

    res.status(200).json(searched);
  });

  router.get("/filter", async (req, res) => {
    const filter = new Filter(req.query);
    const result = await pricedetail.ReadMany(filter.Get());

    res.status(200).json(result.rows);
  });

  router.put("/", async (req, res) => {
    const { recid } = req.body;

    const update = await pricedetail.CreateOrUpdate({ recid: recid }, req.body);
    res.status(200).json(update);
  });

  router.put("/all/:prccde", async (req, res) => {
    const { prccde } = req.params;
    const { page, pageSize } = req.query;
    const { uncheckedItems } = req.body;
    const itemsInstance = modelList.item.instance.GetInstance();

    const pdetail = await pricedetailInstance.findAll({
      where: { prccde: prccde },
      attributes: ["itmcde"],
      raw: true
    })
    let pdetailMapped = pdetail.map((pdetail) => pdetail.itmcde);
    pdetailMapped = pdetailMapped.length > 0 ? [...pdetailMapped, ...uncheckedItems] : uncheckedItems;

    const findItems = await itemsInstance.findAll({
      where: {
        itmcde: {
          [Op.notIn]: pdetailMapped
        }
      },
      raw: true
    });

    const mappedItems = findItems.map((item) => {
      return {
        untprc: item.untprc,
        untmea: item.untmea,
        itmcde: item.itmcde,
        itmdsc: item.itmdsc,
        prccde: prccde,
      }
    });

    await pricedetail.BulkCreate(mappedItems);

    const findAll = await pricedetailInstance.findAndCountAll(
      paginate({
        where: { prccde: prccde },
      }, {
        page: page || 0, pageSize: pageSize || 10
      })
    );

    res.status(200).json({
      items: findAll.rows,
      rows: Math.ceil(findAll.count / pageSize)
    });
  });

  router.get("/all/:id", async (req, res) => {
    const { id } = req.params;
    const { page, pageSize } = req.query;

    const find = await pricedetailInstance.findAll(
      paginate({
        where: { 
          prccde: id 
      }}, {
        page: page || 0, pageSize: pageSize || "10"
      })
    );

    res.status(200).json(find);
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    const deleted = await pricedetail.Delete({ recid: id });

    res.status(200).json(deleted);
  });

  router.post("/bulk/:prccde", async (req, res) => {
    const { body, query } = req;
    const { prccde } = req.params;

    await pricedetail.BulkCreate(body);

    const findAll = await pricedetailInstance.findAll(
      paginate({
        where: { prccde: prccde },
      }, {
        page: query.page || 0, pageSize: query.pageSize || 10
      })
    );

    res.status(200).json(findAll);
  });

  router.get("/export", async (req, res) => {
    const template = [
      {
        title: "Item",
        fieldName: "itmdsc"
      },
      {
        title: "Gross Price",
        fieldName: "untprc"
      },
      {
        title: "New Gross",
        fieldName: "newgroprc"
      },
      {
        title: "Effectivity Date (mm-dd-yyyy)",
        fieldName: "effctdte"
      }
    ]

    const filter = new Filter(req.query);
    let offset = 0;
    const limit = 50;

    const fileName = `Item Pricelist (${dateFormatter(new Date(), 'MM-dd-yyyy')}).xls`;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(fileName.replace('.xls', ''));

    // adds header
    ws.addRow([
      template[0].title, 
      template[1].title, 
      template[2].title, 
      template[3].title,
    ]);

    await pricedetail.ReadAllByBatch({
      ...filter.Get(),
      attributes: [
        template[0].fieldName, 
        template[1].fieldName, 
        template[2].fieldName, 
        template[3].fieldName, 
      ]
    }, limit, (data) => {
      const result = data.rows;
      const count = data.count;

      if (offset * limit === 0) offset++;
      const items = offset * limit;

      sendMsg(`Writing ${items - count < 0 ? items : items - (items - count)} items out of ${count}`);

      result.forEach(d => {
        const row = ws.addRow([
          d[template[0].fieldName], 
          parseFloat(d[template[1].fieldName]),
          parseFloat(d[template[1].fieldName]), 
          null
        ]);

        row.getCell(1).numFmt = '0.00';
        row.getCell(2).numFmt = '0.00';
      });

      offset++;
    })

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + fileName
    )

    sendMsg('Done');
    await wb.xlsx.write(res);
    res.end();
  });

  router.post("/import", file.single('file'), async (req, res) => {
    // const filter = new Filter(req.query);
    // const pricelist = modelList.pricelist.instance.GetInstance();
    const item = modelList.item.instance.GetInstance();

    let problemsTxt = '';
    const processRow = async (row, rowNumber) => {
      if (rowNumber === 1) return;

      const maxMos = 12;
      const maxDays = 31;
      const maxYear = 9999;

      const itmdsc = row.getCell(1).value;
      const untprc = row.getCell(2).value;
      const groprc = row.getCell(3).value;
      let effctdte = row.getCell(4).value;

      const findItem = await item.findOne({
        where: {
          itmdsc: itmdsc
        },
        attributes: ["itmdsc", "itmcde", "untprc", "untmea"]
      });

      if (!findItem) {
        problemsTxt += `[Row: ${rowNumber}]: Item does not exist in the masterfile.\n`
      }
      if (typeof untprc !== 'number') {
        problemsTxt += `[Row: ${rowNumber}]: Invalid gross price.\n`
      }
      if (typeof groprc !== 'number') {
        problemsTxt += `[Row: ${rowNumber}]: Invalid new gross price.\n`
      }
      if (!effctdte) {
        problemsTxt += `[Row: ${rowNumber}]: Effectivity date is required.\n`
      }
      
      if (effctdte && (typeof effctdte === 'number' || typeof effctdte === 'object')) {
        problemsTxt += `[Row: ${rowNumber}]: Invalid effectivity date.\n`
      }

      // if (typeof effctdte === 'number') {
      //   // converts the excel date
      //   effctdte = dateFormatter(new Date((effctdte - (25567 + 2))*86400000), 'MM-dd-yyyy');
      // }
      // if (typeof effctdte === 'object') {
      //   effctdte = dateFormatter(effctdte, 'MM-dd-yyyy');
      // }
      if (typeof effctdte === 'string') {
        const splittedDte = effctdte.split('-');

        if (splittedDte.length > 0) {
          const month = parseInt(splittedDte[0]);
          const day = parseInt(splittedDte[1]);
          const year = parseInt(splittedDte[2]);

          if ((month < 1 || month > maxMos) || (day < 1 || day > maxDays) || (year < 1 || year > maxYear)) {
            problemsTxt += `[Row: ${rowNumber}]: Invalid effectivity date.\n`
          } else {
            effctdte = dateFormatter(new Date(year, month - 1, day), 'MM-dd-yyyy');
          }
        }

        // if there's no splittedDte it means the format is incorrect
        if (splittedDte.length === 0) {
          problemsTxt += `[Row: ${rowNumber}]: Invalid effectivity date.\n`
        }
      }

      if (problemsTxt !== '') return;

      // updates or create the data
      const [find, created] = await pricedetailInstance.findOrCreate({
        where: {itmdsc: itmdsc, prccde: req.query.prccde},
        defaults: {
          itmcde: findItem.itmcde,
          untprc: findItem.untprc,
          untmea: findItem.untmea,
          newuntprc: groprc,
          newgroprc: groprc,
          effctdte: effctdte
        }
      });
      // update the data if exists
      if (!created) {
        find.newuntprc = groprc;
        find.newgroprc = groprc;
        find.effctdte = effctdte;
        find.save();
      }
    }

    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(req.file.buffer);
      const ws = wb.getWorksheet(1);

      const promises = [];
      ws.eachRow(async (row, rowNumber) => {
        promises.push(() => processRow(row, rowNumber));
      });

      // import items by batch of 10 to avoid overloading the server 
      // when there are a lot of items to import
      while (promises.length > 0) {
        const batch = promises.splice(0, 500).map(func => func());
        sendMsg(`Remaining items to be imported: ${promises.length}`);
        await Promise.all(batch);
      }

      if (problemsTxt !== '') {
        return res.status(200).json({
          isSuccessful: false,
          problems: problemsTxt
        });
      }
      
      res.status(200).json({isSuccessful: true});
    } catch (err) {
      console.error(err);
      res.status(500).json({error: err});
    }
  });

  const removeOldPrclstQuery = async (where, prccde, page, pageSize, includeWhere) => {
    let find;
    const hasNoPrcdte = await pricedetailInstance.findOne({
      where: {
        prcdte: null,
        prccde: prccde
      }
    });

    if (hasNoPrcdte) {
      find = await pricedetailInstance.findAll({...where});
    }
    else {
      find = await pricedetailInstance.findAll(
        (!page ? {
          where: {
            ...(includeWhere && where.where),
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
          }
        } : paginate({
          where: {
            ...(includeWhere && where.where),
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
          }
        }, {page: page || 0, pageSize: pageSize || "10"}))
      )
    }

    return find;
  }

  return router;
};
