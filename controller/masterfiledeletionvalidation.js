const { Filter } = require("../model");
const { modelList } = require("../model/model")
const express = require('express');
const router = express.Router();

module.exports = masterfileDeletionValidationEndpoint = () => {
  const posfile = modelList.posfile.instance;
  const itemclass = modelList.itemclassification.instance;
  const itemsubclass = modelList.itemsubclassification.instance;
  const item = modelList.item.instance;

  router.get("/", async (req, res) => {
    const filter = new Filter(req.query);

    const result = await posfile.GetInstance()
      .findOne({
        ...filter.Get(),
        raw: true
      })

    if (!result) {
      return res.status(200).json({isAbleToDelete: true});
    }

    res.status(200).json({isAbleToDelete: false});
  });

  router.get("/itemclass", async (req, res) => {
    const filter = new Filter(req.query);
    const itemclassresult = await itemclass.GetInstance().findOne({
      ...filter.Get(),
      include: [{
        model: itemsubclass.GetInstance(),
        include: [{
          model: item.GetInstance(),
          include: [{
            model: posfile.GetInstance(),
            required: true,
          }]
        }]
      }]
    });

    if (!itemclassresult) {
      return res.status(200).json({isAbleToDelete: true});
    }
  
    let isItemUsed = false;
    for (const itemsub of itemclassresult.itemsubclassfiles) {
      isItemUsed = true;
      for (const item of itemsub.itemfiles) {
        if (item.posfile) {
          isItemUsed = true;
          break;
        }
      }
      if (isItemUsed) break;
    }
  
    res.status(200).json({isAbleToDelete: !isItemUsed});
  });
  
  router.get("/itemsubclass", async (req, res) => {
    const filter = new Filter(req.query);
    const specialrequestgroup = modelList.specialrequestgroup.instance;

    const itemsubclassresult = await itemsubclass.GetInstance().findOne({
      ...filter.Get(),
      include: [{
        model: item.GetInstance(),
      }, {
        model: specialrequestgroup.GetInstance()
      }]
    });
  
    let isItemUsed = false;

    if (!itemsubclassresult) {
      return res.status(200).json({isAbleToDelete: true})
    }

    if (itemsubclassresult.itemfiles.length > 0) {
      isItemUsed = true;
    }

    if (itemsubclassresult.modifiergroupfiles.length > 0) {
      isItemUsed = true;
    }
  
    res.status(200).json({isAbleToDelete: !isItemUsed});
  });

  router.get("/dinetype", async (req, res) => {
    const dinetype = modelList.dinetype.instance;
    const pricelist = modelList.pricelist.instance;

    const filter = new Filter(req.query);
    const result = await dinetype.GetInstance().findOne({
      ...filter.Get(),
      include: [{
        model: posfile.GetInstance()
      }, {
        model: pricelist.GetInstance()
      }],
    });

    if (!result) {
      return res.status(200).json({isAbleToDelete: true});
    }

    let isUsed = false;
    if (result.posfile) {
      isUsed = true;
    }
    if (result.pricecodefile1s.length > 0) {
      isUsed = true;
    }

    res.status(200).json({isAbleToDelete: !isUsed});
  });

  router.get("/printerstation", async (req, res) => {
    const filter = new Filter(req.query);
    const printerstation = modelList.locationfile.instance;

    const result = await printerstation.GetInstance()
      .findOne({
        ...filter.Get(),
        include: [{
          model: itemclass.GetInstance()
        }, {
          model: itemsubclass.GetInstance()
        }]
      });

    if (!result) {
      return res.status(200).json({isAbleToDelete: true});
    }

    let isUsed = false;
    if (result.itemclassfiles.length > 0) {
      isUsed = true;
    }
    if (result.itemsubclassfiles.length > 0) {
      isUsed = true;
    }

    res.status(200).json({isAbleToDelete: !isUsed});
  });

  router.get("/specialrequest", async (req, res) => {
    const filter = new Filter(req.query);
    const specialrequestdetail = modelList.specialrequestdetail.instance;

    const result = await specialrequestdetail.GetInstance()
      .findOne({...filter.Get()});

    if (!result) {
      return res.status(200).json({isAbleToDelete: true});
    }

    res.status(200).json({isAbleToDelete: false});
  });

  router.get("/pricelist", async (req, res) => {
    const filter = new Filter(req.query);
    const pricelist = modelList.pricelist.instance;
    const transaction = modelList.transaction.instance;

    const result = await pricelist.GetInstance()
      .findOne({
        ...filter.Get(),
        include: transaction.GetInstance()
      });

    if (!result) {
      return res.status(200).json({isAbleToDelete: false});
    }

    let isUsed = false;
    if (result.takeouttranfiles.length > 0) {
      isUsed = true;
    }

    res.status(200).json({isAbleToDelete: !isUsed});
  });

  router.get("/memc", async (req, res) => {
    const filter = new Filter(req.query);
    const memc = modelList.memc.instance;

    const result = await memc.GetInstance()
      .findOne({
        ...filter.Get(),
        include: [{
          model: item.GetInstance(),
          attributes: ["memc"]
        }, {
          model: posfile.GetInstance(),
          attributes: ["memc"]
        }]
      });

    if (!result) {
      return res.status(200).json({isAbleToDelete: false});
    }

    let isUsed = false;
    if (result.itemfiles.length > 0 || result.posfiles.length > 0) {
      isUsed = true;
    }

    res.status(200).json({isAbleToDelete: !isUsed});
  });

  return router;
}