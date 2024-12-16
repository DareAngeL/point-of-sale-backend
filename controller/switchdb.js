const express = require("express");
const router = express.Router();
const { modelList } = require("../model/model");
const { Sequelize, Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { getSequelize, setSequelize } = require("../database");
const exec = require("child_process").exec;

module.exports = switchDBEndPoints = () => {

  router.post("/", async (req, res) => {

    const {username, password, database,host,servicename} = req.body;

    let dbinfo = {
      alter: false,
      username: username,
      password: password,
      database: database,
      host: host,
      dialect: "mysql",
      timezone: "+08:00",
      dialectOptions: {
        decimalNumbers: true,
      },
      define: {
        underscored: true,
        freezeTableName: true,
        timestamps: false,
      },
      sync: !false,
    };

    // Reference the main sequelize
    let currentSequelize = getSequelize();

    // Close the current sequelize
    await currentSequelize.close();

    // Reference again the new sequelize
    const newSequelize = new Sequelize(dbinfo)

    // Validate the sequelize server
    try {

      await newSequelize.authenticate();
      res.status(200).json({Message: "Changed database"})
      setSequelize(newSequelize);

      // Will restart the server using a batchfile - I think this is unnecessary
    } catch (error) {
      res.status(500).json({error})
    }
  });

  return router;
};
