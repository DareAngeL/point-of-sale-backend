const { Op } = require("sequelize");
const { getWhereLowerCase, dateTodayFormatter } = require("..");

async function onFilterPaginate(
  filters, 
  page,
  pageSize, 
  dineTypeInstance, 
  pricelistInstance
) {
  const parsedFilters = JSON.parse(filters);
  let dinetype;
  let plistWhere = {};

  let foundItems = await fixPricelist(plistWhere, pricelistInstance, page, pageSize);

  const filteredItemsPromises = foundItems.map(async (itm) => {
    for (const filter of parsedFilters) {
      if (filter.id === "postypdsc") {
        const dinetype = await dineTypeInstance.findAll({
          where: {
            postypdsc: getWhereLowerCase(filter)
          },
          attributes: ["postypcde"],
        });

        if (itm.postypcde === dinetype[0]?.postypcde) {
          return itm;
        }
      } else {
        if (itm[filter.id]?.toLowerCase().includes(filter.value.toLowerCase())) {
          return itm;
        }
      }
    }
    return null;
  });

  const filteredItems = await Promise.all(filteredItemsPromises);
  foundItems = filteredItems.filter(itm => itm !== null);

  if (dinetype) {
    const dtypecde = dinetype.map((itm) => itm.postypcde);
    foundItems.length > 0 && (foundItems = foundItems.filter((itm) =>
      dtypecde.includes(itm.postypcde)
    ));
  }

  return {
    items: foundItems,
    rows: Math.ceil(foundItems.length / pageSize)
  }
}

async function onSortPaginate(
  sort,
  page,
  pageSize,
  dineTypeInstance,
  pricelistInstance
) {
  const parsedSort = JSON.parse(sort)[0];
  let foundPlist;

  if (parsedSort.id === "postypdsc") {

    if (parsedSort.desc) {
      // descending
      foundPlist = await fixPricelist({}, pricelistInstance, page, pageSize, {id: "postypdsc", desc: true}, dineTypeInstance);
    } else {
      // ascending
      foundPlist = await fixPricelist({}, pricelistInstance, page, pageSize, {id: "postypdsc", asc: true}, dineTypeInstance);
    }
  } 
  else {
    if (parsedSort.desc) {
      // descending
      foundPlist = await fixPricelist({}, pricelistInstance, page, pageSize, {id: parsedSort.id, desc: true}, dineTypeInstance);
    } else {
      // ascending
      foundPlist = await fixPricelist({}, pricelistInstance, page, pageSize, {id: parsedSort.id, asc: true}, dineTypeInstance);
    }
  }
  
  return {
    items: foundPlist,
    rows: Math.ceil((await pricelistInstance.count({
      where: {
        prcdte: {
          [Op.or]: [
            null, 
            {[Op.lte]: dateTodayFormatter()}
          ],
        }
      },
      group: ["prccde"]
    })).length / pageSize)
  }
}

async function onSearchPaginate(
  search,
  column,
  page,
  pageSize,
  itemInstance,
  // pWhere,
  // pInclude
) {
  // const foundItems = await itemInstance.findAndCountAll(
  //   paginate({
  //     where: {
  //       ...(pWhere && {...pWhere}),
  //       [column]: {
  //         [Op.like]: '%' + search + '%'
  //       }
  //     },
  //     group: ["prccde"],
  //     ...(pInclude && {...pInclude}),
  //     distinct: true // only counts the main models
  //   }, {page: page || 0, pageSize: pageSize || "10"}),
  // );

  let foundItems = await fixPricelist({}, itemInstance, page, pageSize);
  foundItems = foundItems.filter((itm) => itm[column].toLowerCase().includes(search.toLowerCase()));

  return {
    items: foundItems,
    rows: Math.ceil(foundItems.length / pageSize)
  }
}

async function fixPricelist(whereClause, modelInstance, page, pageSize, sort, dineTypeInstance) {

  let findAll = await modelInstance.findAll({
    where: {
      ...whereClause,
      prcdte: {
        [Op.or]: [
          null, 
          {[Op.lte]: dateTodayFormatter()}
        ],
      }
    }
  });
  findAll = reduce(findAll);

  let result
  if (page) {

    result = Object.values(findAll).flat()
    // note: sorting only applies when page and pagesize are specified
    // sorting by ordertype/dinetype
    if (sort && sort.id === 'postypdsc') {
      const dtype = await dineTypeInstance?.findAll(
        {
          attributes: ["postypcde", "postypdsc"],
          raw: true
        }
      );

      sort && (result = result.sort((_a, _b) => {
        const a = _a.dataValues;
        const b = _b.dataValues;
  
        const postypdscA = dtype.find(item => item.postypcde === a.postypcde).postypdsc;
        const postypdscB = dtype.find(item => item.postypcde === b.postypcde).postypdsc;
        
        if (sort === 'desc') {
          return postypdscB.localeCompare(postypdscA);
        } else {
          return postypdscA.localeCompare(postypdscB);
        }
      }));
    }
    // sorting by pricelist name
    else if (sort) {
      sort && (result = result.sort((_a, _b) => {
        const a = _a.dataValues;
        const b = _b.dataValues;
  
        if (sort.desc) {
          return b[sort.id].localeCompare(a[sort.id]);
        } else {
          return a[sort.id].localeCompare(b[sort.id]);
        }
      }));
    }
    
    result = result.slice(page*pageSize, page*pageSize + pageSize);
    console.log('resultAFTER', result.map(itm => itm.dataValues));

  } else {
    result = Object.values(findAll).flat();
  }

  return result;
}

function reduce(_findAll) {
  return _findAll.reduce((acc, curr) => {
    if (acc[curr.prccde]) {
      const prclst = acc[curr.prccde];
      
      if (new Date(prclst[0].dataValues.prcdte) < new Date(curr.prcdte)) {
        acc[curr.prccde] = [curr];
      }
    } else {
      acc[curr.prccde] = [curr];
    }

    return acc;
  }, {});
}

module.exports = {
  onFilterPaginate: onFilterPaginate,
  onSortPaginate: onSortPaginate,
  onSearchPaginate: onSearchPaginate,
  fixPricelist: fixPricelist,
}