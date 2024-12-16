const multer = require("multer");
const fs = require("fs");
const mkdirp = require("mkdirp");
const crypto = require("./crypter");
const path = require("path");
const {modelList} = require("../model/model.js");
const {format, subDays} = require("date-fns");
const {dateTodayFormatter, dateTimeTodayFormatter} = require("../helper/index");

var imgStorage = multer.diskStorage({
  limits: {fileSize: 1},
  destination: async (req, file, next) => {
    const folderCreationCallback = (err) => {
      if (err) {
        console.error(`[multer.js]: ${err}`);
      }
      next(null, xpath);
    };

    const createFolder = () => {
      if (fs.existsSync(xpath)) {
        next(null, xpath);
      } else {
        mkdirp(xpath, folderCreationCallback);
      }
    };

    const result = await modelList["systemparameters"].instance
      .GetInstance()
      .findOne({
        raw: true,
      });

    let ejfolderdate = req.body.trndte;
    if (req.body.type === "ej") {
      const posfile = modelList["posfile"].instance.GetInstance().findOne({
        attributes: ["logtim"],
        where: {
          ordocnum: req.body.ornum,
        },
        order: [["recid", "DESC"]],
        raw: true,
      });
      if (posfile) {
        if (posfile.logtim < result.timestart) {
          ejfolderdate = format(subDays(req.body.trndte, 1), "MM-dd-yyyy");
        }
      }
      const xtrndte = ejfolderdate
        ? format(`${ejfolderdate}`, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      const date = req.body.reportType == 2 ? req.body.zreaddate : xtrndte;
      let ejpath = result.ej_pathfile
        ? `${result.ej_pathfile}/ej/${date}/`
        : `./uploads/ej/${date}`;
      var xpath = path.resolve(ejpath);
      createFolder();
    } else if (req.body.type === "stickerprint") {
      let stickerpath = result.stickerpath
        ? `${result.stickerpath}`
        : `./uploads/stickerprint/${dateTodayFormatter()}`;
      var xpath = path.resolve(stickerpath);
      createFolder();
    } else {
      var xpath = path.resolve(`./uploads/`);
      createFolder();
    }
  },
  filename: (req, res, next) => {
    let filename = "";
    switch (req.body.reportType) {
      case "1":
        filename = "X Reading";
        break;
      case "2":
        filename = "Z Reading";
        break;
      case "4":
        filename = "Bill";
        break;
      case "5":
        filename = "OR";
        break;
      case "6":
        filename = "VOID";
        break;
      case "7":
        filename = "REFUND";
        break;
      default:
        filename = res.originalname;
        break;
    }

    if (req.body.type === "ej") {
      let date =
        req.body.reportType == 2
          ? req.body.zreaddate + " " + format(new Date(), "HHmmss")
          : format(
              req.body.trndte ? req.body.trndte : new Date(),
              "yyyy-MM-dd HHmmss"
            );

      let filename_add = "";
      if (req.body.reportType == "5") {
        filename_add = " - " + req.body.ornum.replace("OR-", "");
      } else if (req.body.reportType == "6") {
        filename_add = " - " + req.body.voidnum.replace("VOID-", "");
      } else if (req.body.reportType == "7") {
        filename_add = " - " + req.body.refnum.replace("REFUND-", "");
      }

      const generatedfilename = filename + " " + date + filename_add + ".pdf";
      req.filename = generatedfilename;
      next(null, generatedfilename);
    } else if (req.body.type === "stickerprint") {
      const generatedfilename =
        filename + " " + format(new Date(), "HHmmss") + ".pdf";
      req.filename = generatedfilename;
      next(null, generatedfilename);
    } else {
      // Handle other types or simply use the original filename
      req.filename = filename;
      next(null);
    }
  },
});

var upload = multer({storage: imgStorage});
module.exports = upload;
