const express = require("express");
const router = express.Router();
const fs = require("fs");
const {modelList} = require("../model/model");
const {dateTodayFormatter, dateFormatter, timeTodayFormatter} = require("../helper/index");
const multer = require("multer");
const { subDays, format } = require("date-fns");
const { isNextDay } = require("../helper/date-helper");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {

    try {
      const {
        date, 
        usePassedDate: forceUsePassedDate // force use the passed date
      } = req.query;

      const result = await modelList["systemparameters"].instance
        .GetInstance()
        .findOne({
          raw: true,
        });
      const timestart = result.timestart; // 00:00:00 sample format

      let origDate;

      if (forceUsePassedDate !== "undefined" && forceUsePassedDate !== "true") {
        const activeDate = date ? new Date(date) : new Date();
        const formatActiveTime = format(activeDate, "hh:mm a");

        const d = new Date('1970-01-01');
        const currDateWithCustomTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), timestart.substr(0, 2), timestart.substr(3, 2), timestart.substr(6, 2));
        const formatStartTime = format(currDateWithCustomTime, "hh:mm a");
        
        if (isNextDay(formatActiveTime, formatStartTime)) {
          origDate = subDays(activeDate, 1);
        }
        else {
          origDate = activeDate;
        }
      }
      else if (forceUsePassedDate !== "undefined" && forceUsePassedDate === "true") {

        console.log("NAFORCE??", forceUsePassedDate);
        // if we are forcing to use the passed date
        if (!date) {
          return cb("No date passed", null);
        }

        origDate = new Date(date);
      }
      else {
        origDate = new Date();
      }

      const outputPath = result.ej_pathfile
        ? `${result.ej_pathfile}/BIR/ej/${dateFormatter(origDate)}/`
        : `./BIR/ej/${dateFormatter(origDate)}/`;

      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, {recursive: true});
      }

      return cb(null, outputPath);
    } catch (error) {
      console.log(error);
      return cb(error, null);
    }
    
  },
  filename: function (req, file, cb) {

    try {
      let transactAbbrev = "INV";
      if (req.query.transaction) {
        switch (req.query.transaction) {
          case "void":
            transactAbbrev = "VOID";
            break;
          case "refund":
            transactAbbrev = "REFUND"
            break;
        }
      }
  
      let filenameReceipt;
  
      if (req.query.transaction !== "z_reading") {
        // filenameReceipt = `${transactAbbrev} ${dateTodayFormatter()} ${Math.floor(
        //   Date.now() / 1000
        // )} - ${file.originalname.slice(0, -4)}.pdf`;
        filenameReceipt = `${transactAbbrev} ${dateTodayFormatter()} ${timeTodayFormatter().replaceAll(':','')} - ${file.originalname.slice(0, -4)}.pdf`;
      } else {
        // filenameReceipt = `${file.originalname.slice(0, -4)} ${Math.floor(Date.now() / 1000)}.pdf`
        filenameReceipt = `${file.originalname.slice(0, -4)} ${timeTodayFormatter().replaceAll(':','')}.pdf`
      }
  
      return cb(null, filenameReceipt);
      
    } catch (error) {
      
      return cb(error, null);
    }
    
  },
});
const upload = multer({storage});

module.exports = receiptOrderFilePath = () => {
  router.post("/", upload.single("file"), async (req, res) => {

    try {
      res.status(200).json({msg: "File successfully saved"});
    } catch (error) {
      res.status(400).json({msg: "File not saved"});
    }
  });
  return router;
};
