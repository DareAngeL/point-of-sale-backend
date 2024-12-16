const { idFormatter } = require("../helper/index");
const sequelize = require("sequelize");
const { paginate } = require("../helper/paginate/pagination");
const Op = require("sequelize").Op;
const arg = process.argv[2];
const env = !arg ? "dev" : arg;

class Filter {
  constructor(query) {
    this.query = query;
  }
  Get() {
    const sequel_query = {};
    Object.keys(this.query).forEach((value) => {
      switch (value) {
        case "_includes":
          if (!sequel_query["attributes"]) {
            sequel_query["attributes"] = [];
          }
          this.query[value].split(",").forEach((valueContent) => {
            sequel_query["attributes"].push(valueContent);
          });
          break;
        case "_limit":
          sequel_query["limit"] = parseInt(this.query[value] || 0);
          break;
        case "_groupby":
          if (!sequel_query["group"]) {
            sequel_query["group"] = [];
          }
          this.query[value].split(",").forEach((valueContent) => {
            sequel_query["group"].push(valueContent);
          });
          break;
        case "_offset":
          sequel_query["offset"] = parseInt(this.query[value] || 0);
          break;
        case "_sortby":
          if (!sequel_query["order"]) {
            sequel_query["order"] = [];
          }
          this.query[value].split(",").forEach((valueContent) => {
            const field = valueContent.split(":")[0];
            const sort = valueContent.split(":")[1]
              ? valueContent.split(":")[1].toUpperCase() == "DESC"
                ? "DESC"
                : "ASC"
              : "ASC";
            sequel_query["order"].push([field, sort]);
          });
          break;
        default:
          if (!sequel_query["where"]) {
            sequel_query["where"] = {};
          }

          if (typeof this.query[value] !== "object") {
            this.query[value] = [this.query[value]];
          }
          this.query[value].forEach((tmp) => {
            switch (tmp.split(":")[0]) {
              case "or":
                if (tmp.split(":")[1].split(",").length > 0) {
                  sequel_query["where"][tmp.split(":")[0]];
                  if (!sequel_query["where"][value]) {
                    sequel_query["where"][value] = {};
                  }
                  if (!sequel_query["where"][value][Op.or]) {
                    sequel_query["where"][value][Op.or] = {};
                  }
                  let xquery;
                  tmp
                    .split(":")[1]
                    .replace("[", "")
                    .replace("]", "")
                    .split(",")
                    .forEach((value2) => {
                      if (value2.indexOf("=") > 0) {
                        //http://localhost:4000/api/mmenufile2?menucde=or:[like=COCKTAIL-008]
                        const command = value2.split("=")[0];
                        const commandValue = value2.split("=")[1];
                        if (!xquery) {
                          xquery = {};
                        }
                        switch (command) {
                          case "like":
                            xquery[Op[command]] = `%${commandValue}%`;
                            break;
                          case "slike":
                            xquery[Op.startsWith] = `%${commandValue}`;
                            break;
                          case "elike":
                            xquery[Op.endsWith] = `${commandValue}%`;
                            break;
                          default:
                            xquery[Op[command]] = commandValue;
                            break;
                        }
                      } else {
                        //http://localhost:4000/api/mmenufile2?menucde=or:[COCKTAIL-008]
                        if (!xquery) {
                          xquery = [];
                        }
                        xquery.push({
                          [Op.eq]: value2,
                        });
                      }
                    });
                  sequel_query["where"] = {
                    ...sequel_query["where"],
                    ...{
                      [value]: {
                        [Op.or]: xquery,
                      },
                    },
                  };
                }
                break;
              case "and":
                if (tmp.split(":")[1].split(",").length > 0) {
                  sequel_query["where"][tmp.split(":")[0]];
                  if (!sequel_query["where"][value]) {
                    sequel_query["where"][value] = {};
                  }
                  if (!sequel_query["where"][value][Op.and]) {
                    sequel_query["where"][value][Op.and] = {};
                  }
                  let xquery;
                  tmp
                    .split(":")[1]
                    .replace("[", "")
                    .replace("]", "")
                    .split(",")
                    .forEach((value2) => {
                      if (value2.indexOf("=") > 0) {
                        //http://localhost:4000/api/mmenufile2?menucde=and:[like=COCKTAIL-008]
                        const command = value2.split("=")[0];
                        const commandValue = value2.split("=")[1];
                        if (!xquery) {
                          xquery = {};
                        }
                        switch (command) {
                          case "like":
                            xquery[Op[command]] = `%${commandValue}%`;
                            break;
                          case "slike":
                            xquery[Op.startsWith] = `%${commandValue}`;
                            break;
                          case "elike":
                            xquery[Op.endsWith] = `${commandValue}%`;
                            break;
                          default:
                            xquery[Op[command]] = commandValue;
                            break;
                        }
                      } else {
                        //http://localhost:4000/api/mmenufile2?menucde=and:[COCKTAIL-008]
                        if (!xquery) {
                          xquery = [];
                        }
                        xquery.push({
                          [Op.eq]: value2,
                        });
                      }
                    });
                  sequel_query["where"] = {
                    ...sequel_query["where"],
                    ...{
                      [value]: {
                        [Op.and]: xquery,
                      },
                    },
                  };
                }
                break;
              case "in":
                if (tmp.split(":")[1].split(",").length > 0) {
                  sequel_query["where"][value] = {
                    [Op.in]: tmp.split(":")[1].split(","),
                  };
                }
                break;
              case "nin":
                if (tmp.split(":")[1].split(",").length > 0) {
                  sequel_query["where"][value] = {
                    [Op.notIn]: tmp.split(":")[1].split(","),
                  };
                }
                break;
              case "between":
                if (tmp.split(":")[1].split(",").length == 2) {
                  sequel_query["where"][value] = {
                    [Op.between]: tmp.split(":")[1].split(","),
                  };
                }
                break;
              case "nbetween":
                if (tmp.split(":")[1].split(",").length == 2) {
                  sequel_query["where"][value] = {
                    [Op.notBetween]: tmp.split(":")[1].split(","),
                  };
                }
                break;
              case "like":
                sequel_query["where"][value] = {
                  [Op.like]: `%${tmp.split(":")[1]}%`,
                };
                break;
              case "slike":
                sequel_query["where"][value] = {
                  [Op.startsWith]: tmp.split(":")[1],
                };
                break;
              case "elike":
                sequel_query["where"][value] = {
                  [Op.endsWith]: tmp.split(":")[1],
                };
                break;
              case "gte":
                sequel_query["where"][value] = {
                  [Op.gte]: tmp.split(":")[1],
                };
                break;
              case "gt":
                sequel_query["where"][value] = {
                  [Op.gt]: tmp.split(":")[1],
                };
                break;
              case "lte":
                sequel_query["where"][value] = {
                  [Op.lte]: tmp.split(":")[1],
                };
                break;
              case "lt":
                sequel_query["where"][value] = {
                  [Op.lt]: tmp.split(":")[1],
                };
                break;
              case "ne":
                sequel_query["where"][value] = {
                  [Op.ne]: tmp.split(":")[1],
                };
                break;
              case "eq":
                sequel_query["where"][value] = {
                  [Op.eq]: tmp.split(":")[1],
                };
                break;
              case "search":
                sequel_query["where"][value] = {
                  [Op.like]: "%" + tmp.split(":")[1] + "%",
                };
                break;
              case "eqv2":
                sequel_query["where"][value] = {
                  [Op.eq]:
                    tmp.split(":")[1] === "null" ? null : tmp.split(":")[1],
                };
                break;
              case "nev2":
                sequel_query["where"][value] = {
                  [Op.ne]:
                    tmp.split(":")[1] === "null" ? null : tmp.split(":")[1],
                };
                break;
              default:
                sequel_query["where"][value] = {
                  [Op.eq]: tmp,
                };
                break;
            }
          });

          break;
      }
    });
    return sequel_query;
  }
}

class BaseModel {
  modelList = {};

  constructor(model) {
    this.model = model;
  }

  async Read() {
    return await this.model.findAll();
  }

  async ReadMany(filter) {
    return await this.model.findAndCountAll(filter);
  }

  async ReadOne(id) {
    return await this.model.findOne({ where: { recid: id } });
  }

  async ReadAllByBatch(query, limit, onFetch) {
    let offset = 0;

    while (true) {
      const findAll = await this.model.findAndCountAll(
        paginate(query, { page: offset, pageSize: limit })
      );

      if (findAll.rows.length === 0) break;

      onFetch(findAll);
      offset++;
    }
  }

  async Create(object) {
    return await this.model.create(object);
  }

  async Update(filter, object) {
    const findModel = await this.model.findOne({ where: filter });

    findModel.update(object);

    return await findModel.save();
  }

  async UpdateId(field) {
    const find = await this.modelList.systemparameters.instance
      .GetInstance()
      .findOne({});
    const x = find[field];

    let split = x.split("-");
    const length = split[1].length;

    let convertedNum = parseInt(split[1]);
    convertedNum++;

    split[1] = idFormatter(convertedNum, length);
    const join = split.join("-");
    find[field] = join;

    await find.save();
    return join;
  }

  async CreateOrUpdate(filter, object, idField, modelIdField) {
    let { recid } = filter;

    if (!recid) {
      let id = "";
      if (idField && modelIdField) id = await this.UpdateId(idField);

      object[modelIdField] = id;

      return await this.Create(object);
    }

    const existingModel = await this.model.findOne({ where: filter });

    if (!existingModel) {
      // No existing record found, create a new one
      return await this.Create(object);
    } else {
      // Existing record found, update it
      await existingModel.update(object); // Use await to wait for the update operation
      return existingModel; // Return the updated model
    }
  }

  async Count() {
    return await this.model.count();
  }

  async Delete(filter) {
    try {
      const findModel = await this.model.findOne({ where: filter });

      return await findModel.destroy();
    } catch (e) {
      console.error(e);
    }
  }

  async BulkCreate(object) {
    const bulkCreate = await this.model.bulkCreate(object);
    return await bulkCreate;
  }

  GetInstance() {
    return this.model;
  }

  GetModelListInstance() {
    return this.modelList;
  }

  SetModelList(model) {
    this.modelList = model;
  }
}

module.exports = { Filter: Filter, BaseModel: BaseModel };
