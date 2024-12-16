const { literal, Op } = require("sequelize");
const { getWhereLowerCase, _log } = require("..");
const { paginate } = require("./pagination");

async function onFilterPaginate(
  filters, 
  page,
  pageSize,
  itemInstance, 
  itemclassInstance, 
  itemsubclassInstance
) {
  const parsedFilters = JSON.parse(filters);
  let itmclass, itmsubclass;
  let itmWhere = {};

  for (const filter of parsedFilters) {
    if (filter.id === "itmcladsc") {
      itmclass = await itemclassInstance.findAll({
        where: {
          itmcladsc: getWhereLowerCase(filter)
        },
        attributes: ["itmclacde"],
      });
    } else if (filter.id === "itemsubclassdsc") {
      itmsubclass = await itemsubclassInstance.findAll({
        where: {
          itemsubclassdsc: getWhereLowerCase(filter)
        },
        attributes: ["itemsubclasscde"],
      });
    } else {
      if (filter.id === "untprc") {
        itmWhere[filter.id] = filter.value;
      } else {
        itmWhere[filter.id] = getWhereLowerCase(filter);
      }
    }
  }

  // if there is no filter that is specific for the items
  // then just filter from class or subclass
  if (!(Object.keys(itmWhere).length > 0)) {
    // find items instead that has itmclacde or itmsubclacde

    if (itmclass && itmclass.length > 0) {
      const itmclasscde = itmclass.map((itm) => itm.itmclacde);
      itmWhere.itmclacde = itmclasscde;
    }

    if (itmsubclass && itmsubclass.length > 0) {
      const itmsubclasscde = itmsubclass.map((itm) => itm.itemsubclasscde);
      itmWhere.itemsubclasscde = itmsubclasscde;
    }

    const foundItems = await itemInstance.findAndCountAll(
      paginate({
        where: {
          ...itmWhere,
        }
      }, {page: page || 0, pageSize: pageSize || "10"}),
    );

    return {
      items: foundItems.rows, 
      rows: Math.ceil(foundItems.count / pageSize)
    }
  }

  let foundItems = await itemInstance.findAndCountAll(
    paginate({
      where: {
        ...itmWhere,
      }
    }, {page: page || 0, pageSize: pageSize || "10"}),
  );

  if (itmclass) {
    const itmclasscde = itmclass.map((itm) => itm.itmclacde);
    foundItems.length > 0 && (foundItems = foundItems.filter((itm) =>
      itmclasscde.includes(itm.itmclacde)
    ));
  }

  if (itmsubclass) {
    const itmsubclasscde = itmsubclass.map((itm) => itm.itemsubclasscde);
    foundItems.length > 0 && (foundItems = foundItems.filter((itm) =>
      itmsubclasscde.includes(itm.itemsubclasscde)
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
  itemInstance, 
  itemclassInstance, 
  itemsubclassInstance
) {
  const parsedSort = JSON.parse(sort)[0];
  let foundItems;

  switch (parsedSort.id) {
    case "itmcladsc":
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
  
        foundItems = await itemInstance.findAndCountAll(
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
  
        foundItems = await itemInstance.findAndCountAll(
          paginate({
            where: { 
              itmclacde: foundItemclass.map(item => item.itmclacde) 
            },
            order: literal(`FIELD(itmclacde, ${orderedItemCodes.join(',')})`)
          }, {page: page || 0, pageSize: pageSize || "10"})
        );
      }
      break;
    case "itemsubclassdsc":
      if (parsedSort.desc) {
        // if descending
        const foundSubItemclass = await itemsubclassInstance.findAll(
          {
            order: [["itemsubclassdsc", "DESC"]],
            attributes: ["itemsubclasscde"],
            raw: true
          }
        );
  
        const orderedItemCodes = foundSubItemclass.map(item => `'${item.itemsubclasscde}'`);
  
        foundItems = await itemInstance.findAndCountAll(
          paginate({
            where: { 
              itemsubclasscde: foundSubItemclass.map(item => item.itemsubclasscde) 
            },
            order: literal(`FIELD(itemsubclasscde, ${orderedItemCodes.join(',')})`)
          }, {page: page || 0, pageSize: pageSize || "10"})
        );
      } else {
        // if ascending
        const foundSubItemclass = await itemsubclassInstance.findAll({
          order: [["itemsubclassdsc", "ASC"]],
          attributes: ["itemsubclasscde"],
          raw: true
        });
  
        const orderedItemCodes = foundSubItemclass.map(item => `'${item.itemsubclasscde}'`);
  
        foundItems = await itemInstance.findAndCountAll(
          paginate({
            where: { 
              itemsubclasscde: foundSubItemclass.map(item => item.itemsubclasscde) 
            },
            order: literal(`FIELD(itemsubclasscde, ${orderedItemCodes.join(',')})`)
          }, {page: page || 0, pageSize: pageSize || "10"})
        );
      }
      break;
    default:
      if (parsedSort.desc) {
        // descending
        foundItems = await itemInstance.findAndCountAll(
          paginate({
            order: [[parsedSort.id, "DESC"]],
            raw: true
          }, {page: page || 0, pageSize: pageSize || "10"})
        );
      } else {
        // ascending
        foundItems = await itemInstance.findAndCountAll(
          paginate({
            order: [[parsedSort.id, "ASC"]],
            raw: true
          }, {page: page || 0, pageSize: pageSize || "10"})
        );
      }
      break;
  }

  return {
    items: foundItems.rows,
    rows: Math.ceil(foundItems.count / pageSize)
  }
}

module.exports = {
  onFilterPaginate,
  onSortPaginate
}