const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = specialrequestEndpoints = () => {
  const specialrequest = modelList.specialrequest.instance;
  const sqlInstance = modelList.specialrequest.sqlInstance;
  const specialrequestgroup =
    modelList.specialrequestgroup.instance.GetInstance();
  const specialrequestdetail =
    modelList.specialrequestdetail.instance.GetInstance();
  const syspar = modelList.systemparameters.instance.GetInstance();

  router.get("/", async (req, res) => {
    const {page, pageSize, filters, sort} = req.query;
    const specialrequestInst = modelList.specialrequest.instance.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        specialrequestInst,
        page || 0,
        pageSize || 0,
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        specialrequestInst,
        page || 0,
        pageSize || 0,
      ))
    }

    const find = await specialrequestInst.findAll(
      paginate({include: specialrequestgroup}, {page: page || 0, pageSize: pageSize || "10"})
    )

    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await specialrequest.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "modcde",
      page || 0,
      pageSize || 0,
      specialrequest.GetInstance(),
    ));
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;
    const {modifiergroupfiles, ...other} = req.body;

    try {
      const result = await sqlInstance.transaction(async (t) => {
        const spcRequest = await specialrequest.CreateOrUpdate(
          {recid: recid},
          other
        );

        const spcRequestGrp = await specialrequestgroup.bulkCreate(
          modifiergroupfiles,
          {
            updateOnDuplicate: ["modgrpcde", "modcde"],
          }
        );

        return {spcRequest, spcRequestGrp};
      });

      const {spcRequest, spcRequestGrp} = result;

      const data = spcRequest.dataValues;
      data.modifiergroupfiles = spcRequestGrp.map((d) => d.dataValues);
      res.status(200).json(data);
    } catch (error) {
      console.error("uno", error);
      console.log("wat", error.original);
      if (error.original.code === "ER_DUP_ENTRY") {
        console.log("dito ba?");
        res.status(409).json(error);
      } else {
        res.status(500).send(undefined);
      }
    }
  });

  router.post("/detail", async (req, res) => {
    const {body} = req;
    const createSrDetail = await specialrequestdetail.create(body);
    res.status(200).json(createSrDetail);
  });

  router.post("/bulkDetail", async (req, res) => {
    const {body} = req;
    const createSrDetail = await specialrequestdetail.bulkCreate(body);
    res.status(200).json(createSrDetail);
  });

  router.delete("/deleteDetail/:recid", async (req, res) => {
    const {recid} = req.params;

    const deleted = await specialrequestdetail.destroy({where: {recid: recid}});

    res.status(200).json(deleted);
  });

  router.get("/details/:ordercde?", async (req, res) => {
    const {ordercde} = req.params;
    const findSyspar = await syspar.findOne({});

    const findSrDetail = await specialrequestdetail.findAll({
      where: {ordercde: ordercde || findSyspar.ordercde},
    });

    res.status(200).json(findSrDetail);
  });

  router.delete("/:modcde", async (req, res) => {
    const {modcde} = req.params;

    try {
      const deleted = await specialrequest.GetInstance().destroy({
        where: {
          modcde: modcde,
        },
      });

      res.status(200).json(deleted);
    } catch (error) {
      console.error(error);
      res.status(500).json(undefined);
    }
  });

  return router;
};
