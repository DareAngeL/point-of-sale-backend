const { Op } = require("sequelize");
const { Filter } = require("../model");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();

module.exports = userAccessEndpoints = () => {
  const useraccess = modelList.useraccess.instance;

  router.get("/filter", async (req, res) => {
    const usrcde = req.query.usrcde;

    const result = await useraccess.GetInstance().findAll({
      where: {
        usrcde: req.query.usrcde,
        [Op.or]: [
          { usrcde: usrcde, allowadd: 1 },
          { usrcde: usrcde, allowdelete: 1 },
          { usrcde: usrcde, allowedit: 1 },
          { usrcde: usrcde, allowimport: 1 },
          { usrcde: usrcde, allowprint: 1 },
          { usrcde: usrcde, allowresend: 1 },
          { usrcde: usrcde, allowvoid: 1 }
        ]
      }
    });

    res.status(200).json(result);
  });

  return router;
};
