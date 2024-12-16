const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = menusEndpoints = () => {
  const menus = modelList.menus.instance;
  const syspar = modelList.systemparameters.instance;
  const menuModel = menus.GetInstance();

  router.get("/", async (req, res) => {
    const find = await menus.Read();
    res.status(200).json(find);
  });


  router.get("/masterfile", async (req,res) => {

    const findMenuMasterfile = await menuModel.findAll({where: {mengrp: "MASTERFILE"}});

    const sysparData = await syspar.Read();
    const allowPrinterStation = sysparData[0].allow_printerstation === 1;

    // Remove Printer Stations if not set to allow
    if (!allowPrinterStation) {
      findMenuMasterfile.splice(findMenuMasterfile.findIndex((x) => x.mencap === "PRINTER STATIONS"), 1);
    }

    res.status(200).json(findMenuMasterfile)

  })

  return router;
};
