const express = require("express");
const router = express.Router();
const {modelList} = require("../model/model");
const { _log } = require("../helper");

module.exports = branchFileEndpoints = () => {
  const branchfile = modelList.branchfile.instance.GetInstance();

  router.get("/", async (req, res) => {
    const {branchcode} = req.query;

    if (branchcode) {
        const branch = await branchfile.findOne({
          where: {brhcde: branchcode},
          raw: true,
        });

      return res.status(200).json({branch});
    }

    // else fetch all branches
    const branches = await branchfile.findAll({raw: true});

    res.status(200).json({branches});
  });

  router.put("/", async (req, res) => {
    const branches = req.body;
    const headerfile = modelList.headerfile.instance;

    try {
      // clear branchfile table
      await branchfile.destroy({where: {}});
      await branchfile.bulkCreate(branches);

      // get the headerfile
      const header = await headerfile.GetInstance().findOne({});

      // check if result contains the brhdsc from header
      const foundBranch = branches.find(branch => branch.brhdsc === header.brhdsc);
      if (foundBranch) {
        return res.status(200).json({success: true});
      }

      // if not, clear the brhdsc from header
      header.brhdsc = "";
      await header.save();
      res.status(200).json({success: true});
    } catch (error) {
      _log(error)
      res.status(500).send(undefined);
    }
  });

  return router;
}