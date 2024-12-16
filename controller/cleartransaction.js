const express = require("express");
const router = express.Router();
const { modelList } = require("../model/model");
const { fs } = require("file-system");

module.exports = clearTransactionEndPoints = () => {
  router.get("/", async (req, res) => {
    const arrTables = [
      // "forftpfile",
      "posfile",
      "transaction",
      "orderitemdiscount",
      // "orderitemmodifierfile",
      "useractivitylog",
      // "zreadingfile",
    ];

    for (const table of arrTables) {
      await modelList[table].instance
        .GetInstance()
        .destroy({
          where: {
            // criteria
          },
          cascade: true,
        })
        .then(() => {
          console.log(`Table '${table}' Reset`);
        })
        .catch((e) => console.error(e.message));
    }

    await modelList.systemparameters.instance.GetInstance().update(
      {
        ordocnum: "OR-0000000000000001",
        posdocnum: "POS-0000000000000001",
        seqnum: "SEQ-0000000000000000",
        billnum: "BILL-0000000000000001",
        voidnum: "VOID-0000000000000001",
        billdocnum: "BLN-0000000000001",
        ordercde: "ORD-0000000000001",
        rddocnum: "RD-0000000000000",
        rsdocnum: "RS-0000000000000",
        tidocnum: "TI-0000000000000",
        todocnum: "TO-0000000000000",
        wsdocnum: "WS-0000000000000",
        pcdocnum: "PC-0000000000000",
        refnum: "REF-0000000000000001",
      },
      {
        where: {
          recid: 1,
        },
      }
    );

    if (fs.existsSync("./uploads/central/transaction")) {
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
      removeDir("./uploads/central/transaction");
    }

    res.send({
      success: true,
      message: "Successfully Reset Transaction",
    });
  });

  return router;
};
