/* eslint-disable no-undef */
const path = require("path");
const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();
const fs = require('fs');
const { autoTransferTransaction } = require("../scheduler/autotransfertransaction");

module.exports = systemparametersEndpoints = () => {
  //TODO : HANDLE ERROR - NO TABLE EXISTING

  const systemparameters = modelList.systemparameters.instance;
  const mallhookupfile = modelList.mallhookupfile.instance;
  const headerfile = modelList.headerfile.instance;

  router.get("/", async (req, res) => {
    const find = await systemparameters.Read();
    res.status(200).json(find);
  });

  router.get("/mallhookuplist/", async (req, res) => {
    const find = await mallhookupfile.Read();
    res.status(200).json(find);
  });

  router.get("/def_backup_path", async (req, res) => {

    const syspar = await systemparameters.GetInstance().findOne({});

    const dbbackup_pathfile = syspar.dbbackup_pathfile;

    if (process.env.NODE_ENV === 'development') {
      // if in development env
      if (dbbackup_pathfile === '' || dbbackup_pathfile === null) {
        const dirPath = path.resolve(__dirname, '../backup');

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
        
        syspar.dbbackup_pathfile = dirPath;
        syspar.save();

        res.status(200).json({path: dirPath});
      } else {
        res.status(200).json({path: dbbackup_pathfile});
      }
    } else {
      // else if in production env
      if (dbbackup_pathfile === '' || dbbackup_pathfile === null) {
        const dirPath = path.resolve(path.dirname(process.execPath), './backup');

        if (!fs.existsSync(dirPath)) {
          // fs.mkdirSync(dirPath);
        }
        
        syspar.dbbackup_pathfile = dirPath;
        syspar.save();

        res.status(200).json({path: dirPath});
      } else {
        res.status(200).json({path: dbbackup_pathfile});
      }
    }
  });

  router.put("/", async (req, res) => {
    const {recid} = req.body;

    const count = await systemparameters.Count();

    if (count <= 0) {
      const post = await systemparameters.Create(req.body);
      autoTransferTransaction();

      return res.status(200).json();
    }

    const update = await systemparameters.Update({recid: recid}, req.body);
    autoTransferTransaction();
    res.status(200).json(update);
  });

  router.put("/clearHeader", async (req, res) => {
    // remove the branchcode, brhdsc and warehouse during enabling/disabling central connection
    const header = await headerfile.Read();
    header[0].brhcde = null
    header[0].brhdsc = null
    header[0].warcde = null
    await header[0].save();
  });

  router.delete("/:id", async (req, res) => {
    const {id} = req.params;

    const deleted = await systemparameters.Delete({recid: id});

    res.status(200).json(deleted);
  });

  router.get("/getOrdocnum", async (req, res) => {
    const syspar = await systemparameters.GetInstance().findOne({attributes: ['ordocnum']});
    res.status(200).json({ordocnum: syspar.ordocnum});
  });

  return router;
};
