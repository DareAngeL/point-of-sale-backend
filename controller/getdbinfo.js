const express = require("express");
const router = express.Router();
const { initDatabase } = require("../database");

module.exports = getDBInfoEndPoints = () => {
  router.get("/", async (req, res) => {
    const databaseInfo = initDatabase().config;
    res.send({
      username: databaseInfo.username,
      password: databaseInfo.password,
      database: databaseInfo.database,
      host: databaseInfo.host,
    });
  });

  return router;
};
