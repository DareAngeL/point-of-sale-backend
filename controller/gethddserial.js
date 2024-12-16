const express = require("express");
const router = express.Router();
const { generateSecurityCode } = require("../helper/identifier");

module.exports = getHDDSerialNumberEndPoints = () => {
  router.get("/", async (req, res) => {
    try {

      const seccode = await generateSecurityCode();

      console.log(seccode);
      
      res.send(
        seccode
      );

      
    } catch (error) {
      console.log(error);
    }
  });

  return router;
};
