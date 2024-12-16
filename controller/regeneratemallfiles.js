const express = require("express");
const router = express.Router();
const {modelList} = require("../model/model");
const {Op} = require("sequelize");
const fs = require("fs");
const path = require("path");

module.exports = regenerateMallFiles = () => {
  const posfile = modelList.posfile.instance;
  const pos = posfile.GetInstance();

  router.post("/", async (req, res) => {
    const {dateFrom, dateTo, mallName, fileType, basePath} = req.body;

    try {
      const find = await pos.findAll({
        where: {
          trndte: {
            [Op.between]: [dateFrom, dateTo],
          },
        },
      });

      if (find.length === 0) {
        return res
          .status(200)
          .json({msg: "Nothing to save! No Transactions Found!", data: find});
      }

      // do something about the data related to z read

      // conversion
      const contents = [Object.keys(find[0].dataValues)];
      for (const obj of find) {
        const values = Object.keys(find[0].dataValues).map((key) => {
          const value = obj[key];
          if (typeof value !== "function") {
            return value !== null ? value : ""; // Replace null with an empty string
          }
          return ""; // Replace functions with an empty string
        });
        contents.push(values);
      }

      const csvContent = contents.map((row) => row.join(",")).join("\n");
      // changed this based on the syspar
      const baseFolderPath = path.join(require("os").homedir(), "Downloads");
      const posFolderPath = path.join(baseFolderPath, "POS");
      const mallsFolderPath = path.join(posFolderPath, "MallFiles");
      const mallFilesFolderPath = path.join(mallsFolderPath, `${mallName}`);

      const timestamp = Date.now();
      const fileExtention = fileType === "txt" ? "txt" : "csv";
      const filename = path.join(
        mallFilesFolderPath,
        `RegeneratedMallFile_${dateFrom}_to_${dateTo}_${timestamp}.${fileExtention}`
      );

      if (!fs.existsSync(posFolderPath)) {
        fs.mkdirSync(posFolderPath);
      }
      if (!fs.existsSync(mallsFolderPath)) {
        fs.mkdirSync(mallsFolderPath);
      }
      if (!fs.existsSync(mallFilesFolderPath)) {
        fs.mkdirSync(mallFilesFolderPath);
      }

      fs.writeFileSync(filename, csvContent, "utf-8");

      res.status(200).json({msg: "success", data: find});
    } catch (error) {
      console.error(error);
      res.status(500).json({error});
    }
  });
  return router;
};
