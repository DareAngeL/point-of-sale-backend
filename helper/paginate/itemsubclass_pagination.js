const { literal } = require("sequelize");
const { getWhereLowerCase } = require("..");
const { paginate } = require("./pagination");

async function onFilterPaginate(
  filters, 
  page,
  pageSize, 
  itemclassInstance, 
  itemsubclassInstance
) {
  const parsedFilters = JSON.parse(filters);
  let itmclass;
  let itmsubclaWhere = {};

  for (const filter of parsedFilters) {
    if (filter.id === "itmcladsc") {
      itmclass = await itemclassInstance.findAll({
        where: {
          itmcladsc: getWhereLowerCase(filter)
        },
        attributes: ["itmclacde"],
      });
    } else {
      itmsubclaWhere[filter.id] = getWhereLowerCase(filter);
    }
  }

  // if there is no filter that is specific for the items
  // then just filter from class
  if (!(Object.keys(itmsubclaWhere).length > 0)) {
    if (itmclass && itmclass.length > 0) {
      const itmclasscde = itmclass.map((itm) => itm.itmclacde);
      itmsubclaWhere.itmclacde = itmclasscde;
    }

    const foundItems = await itemsubclassInstance.findAndCountAll(
      paginate({
        where: {
          ...itmsubclaWhere,
        }
      }, {page: page || 0, pageSize: pageSize || "10"}),
    );

    return {
      items: foundItems.rows, 
      rows: Math.ceil(foundItems.count / pageSize)
    }
  }

  let foundItems = await itemsubclassInstance.findAndCountAll(
    paginate({
      where: {
        ...itmsubclaWhere,
      }
    }, {page: page || 0, pageSize: pageSize || "10"}),
  );

  if (itmclass) {
    const itmclasscde = itmclass.map((itm) => itm.itmclacde);
    foundItems.length > 0 && (foundItems = foundItems.filter((itm) =>
      itmclasscde.includes(itm.itmclacde)
    ));
  }

  return {
    items: foundItems.rows,
    rows: Math.ceil(foundItems.count / pageSize)
  }
}

async function onSortPaginate(
  sort, 
  page,
  pageSize,
  itemclassInstance, 
  itemsubclassInstance
) {
  const parsedSort = JSON.parse(sort)[0];
  let foundSubCla;

  if (parsedSort.id === "itmcladsc") {
    if (parsedSort.desc) {
      // if descending
      const foundItemclass = await itemclassInstance.findAll(
        {
          order: [["itmcladsc", "DESC"]],
          attributes: ["itmclacde"],
          raw: true
        }
      );

      const orderedItemCodes = foundItemclass.map(item => `'${item.itmclacde}'`);

      foundSubCla = await itemsubclassInstance.findAndCountAll(
        paginate({
          where: { 
            itmclacde: foundItemclass.map(item => item.itmclacde) 
          },
          order: literal(`FIELD(itmclacde, ${orderedItemCodes.join(',')})`)
        }, {page: page || 0, pageSize: pageSize || "10"})
      );

    } else {
      // if ascending
      const foundItemclass = await itemclassInstance.findAll({
        order: [["itmcladsc", "ASC"]],
        attributes: ["itmclacde"],
        raw: true
      });

      const orderedItemCodes = foundItemclass.map(item => `'${item.itmclacde}'`);

      foundSubCla = await itemsubclassInstance.findAndCountAll(
        paginate({
          where: { 
            itmclacde: foundItemclass.map(item => item.itmclacde) 
          },
          order: literal(`FIELD(itmclacde, ${orderedItemCodes.join(',')})`)
        }, {page: page || 0, pageSize: pageSize || "10"})
      );
    }
  } else {
    if (parsedSort.desc) {
      // if descending
      foundSubCla = await itemsubclassInstance.findAndCountAll(
        paginate({
          order: [[parsedSort.id, "DESC"]]
        }, {page: page || 0, pageSize: pageSize || "10"}),
      );
    } else {
      // if ascending
      foundSubCla = await itemsubclassInstance.findAndCountAll(
        paginate({
          order: [[parsedSort.id, "ASC"]]
        }, {page: page || 0, pageSize: pageSize || "10"}),
      );
    }
  }

  return {
    items: foundSubCla.rows,
    rows: Math.ceil(foundSubCla.count / pageSize)
  }
}

module.exports = { onFilterPaginate, onSortPaginate }