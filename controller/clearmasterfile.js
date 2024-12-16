const express = require("express");
const router = express.Router();
const { modelList } = require("../model/model");
const { fs } = require("file-system");

module.exports = clearMasterFileEndPoints = () => {
  router.post("/", async (req, res) => {
    for (const table of req.body.tables) {
      await modelList[table].instance
        .GetInstance()
        .destroy({
          where: {
            // criteria
          },
          cascade: true,
        })
        .then(async () => {
          let masterfileLog = table;
          if (table === "warehouse") {
            masterfileLog = "tenant";
          }
          if (table === "itemclassification") {
            masterfileLog = "itemclass";
          }
          if (table === "itemsubclassification") {
            masterfileLog = "itemsubclass";
          }

          await modelList.masterfilelog.instance
            .GetInstance()
            .destroy({ where: { tablename: masterfileLog } })
            .then(async () => {
              if (
                fs.existsSync(`./uploads/central/masterfile/${masterfileLog}`)
              ) {
                const removeDir = function (path) {
                  if (fs.existsSync(path)) {
                    const files = fs.readdirSync(path);

                    if (files.length > 0) {
                      files.forEach(function (filename) {
                        if (fs.statSync(path + "/" + filename).isDirectory()) {
                          removeDir(path + "/" + filename);
                        } else {
                          fs.unlinkSync(path + "/" + filename);
                        }
                      });
                      fs.rmdirSync(path);
                    } else {
                      fs.rmdirSync(path);
                    }
                  } else {
                    console.log("Directory path not found.");
                  }
                };

                removeDir(`./uploads/central/masterfile/${masterfileLog}`);
              }
            });

          console.log(`Table '${table}' Reset`);
        })
        .catch((e) => res.send({ success: false, message: e.message }));
    }
  });

  return router;
};
