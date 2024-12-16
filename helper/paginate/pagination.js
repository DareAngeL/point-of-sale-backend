const { Op } = require("sequelize");
const { getWhereLowerCase } = require("..");

const paginate = (query, { page, pageSize }) => {
  const offset = page * pageSize;
  const limit = parseInt(pageSize);

  return {
    ...query,
    offset,
    limit,
  };
};

async function onFilterPaginate(
  filter,
  model, 
  page,
  pageSize,
  pWhere,
  pInclude,
) {
  const pFilter = JSON.parse(filter);
  let where = {...pWhere};

  for (const filter of pFilter) {
    where[filter.id] = getWhereLowerCase(filter, model.tableName);
  }

  const found = await model.findAndCountAll(
    paginate({
      where: {
        ...where,
      },
      ...(pInclude && {...pInclude}),
      distinct: true // only counts the main model
    }, {page: page || 0, pageSize: pageSize || "10"}),
  );

  return {
    items: found.rows,
    rows: Math.ceil(found.count / pageSize)
  }
}

async function onSortPaginate(
  sort,
  model,
  page,
  pageSize,
  pWhere,
  pInclude
) {
  const parsedSort = JSON.parse(sort)[0];
  let found;

  if (parsedSort.desc) {
    // descending
    found = await model.findAndCountAll(
      paginate({
        where: {
          ...(pWhere && {...pWhere}),
        },
        order: [[parsedSort.id.trim(), "DESC"]],
        ...(pInclude && {...pInclude}),
        distinct: true // only counts the main model
      }, {page: page || 0, pageSize: pageSize || "10"}),
    );
  } else {
    // ascending
    found = await model.findAndCountAll(
      paginate({
        where: {
          ...(pWhere && {...pWhere}),
        },
        order: [[parsedSort.id.trim(), "ASC"]],
        ...(pInclude && {...pInclude}),
        distinct: true // only counts the main model
      }, {page: page || 0, pageSize: pageSize || "10"}),
    );
  }

  return {
    items: found.rows,
    rows: Math.ceil(found.count / pageSize)
  }
}

async function onSearch(
  search,
  column,
  page,
  pageSize,
  itemInstance,
  pWhere,
  pInclude
) {
  const foundItems = await itemInstance.findAndCountAll(
    paginate({
      where: {
        ...(pWhere && {...pWhere}),
        [column]: {
          [Op.like]: '%' + search + '%'
        }
      },
      ...(pInclude && {...pInclude}),
      distinct: true // only counts the main models
    }, {page: page || 0, pageSize: pageSize || "10"}),
  );

  return {
    items: foundItems.rows,
    rows: Math.ceil(foundItems.count / pageSize)
  }
}

module.exports = {
  paginate: paginate,
  onFilterPaginate: onFilterPaginate,
  onSortPaginate: onSortPaginate,
  onSearch: onSearch
};