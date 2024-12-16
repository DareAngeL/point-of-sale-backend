const express = require("express");
const { modelList } = require("../../model/model");
const { format } = require("date-fns");
const router = express.Router();
const {
  LNextsCentral,
  NewTrnCode,
  convertToAccounting_new_v2,
  _log,
} = require("../../helper/index");
const path = require("path");
const { fs } = require("file-system");
const archiver = require("archiver");
!archiver.isRegisteredFormat("zip-encryptable") &&
  archiver.registerFormat(
    "zip-encryptable",
    require("archiver-zip-encryptable")
  );
const { Op, fn, col, literal } = require("sequelize");
const { generateTransferFile } = require("../../services/generateTransferFile");
const { uploadFileToCentral } = require("../../services/uploadFileToCentral");

module.exports = getTransferFileEndPoints = () => {

  const posfile = modelList.posfile.instance;

  router.get("/", async (req, res) => {
    try {
      !!(await require("dns").promises.resolve("google.com"));

      const { docnums: xarr_req, comcde, centralPath } = req.query;

      generateTransferFile(posfile, xarr_req, comcde, true, async (err, data) => {
        if (err) {
          return res.send({
            success: false,
            message: err,
          });
        }

        if (data.success) {
          return res.send(await uploadFileToCentral(posfile, data.filename, `${centralPath}/${data.file}`, xarr_req, true));
        }

        res.send(data);
      });

    } catch (error) {
      res.send({
        success: false,
        message: "No Internet Connection",
      });
    }
  });

  return router;
};
