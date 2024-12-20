const express = require("express");
const router = express.Router();
const uploads = require("../config/multer");

// Import/require the controllers here.
const posUserFileEndpoints = require("./pos-userfile");
const headerfileEndpoints = require("./headerfile");
const systemparametersEndpoints = require("./systemparameters");
const footerEndpoints = require("./footer");
const terminalEndpoints = require("./terminal");
const locationfileEndpoints = require("./locationfile");
const itemclassificationEndpoints = require("./itemclassification");
const itemsubclassificationEndpoints = require("./itemsubclassification");
const itemEndpoints = require("./item");
const specialrequest = require("./specialrequest");
const cardtype = require("./cardtype");
const freereason = require("./freereason");
const otherpayment = require("./otherpayment");
const dinetype = require("./dinetype");
const discount = require("./discount");
const pricelist = require("./pricelist");
const pricedetail = require("./pricedetail");
const warehouse = require("./warehouse");
const warehousedetail = require("./warehousedetail");
const memc = require("./memc");
const company = require("./company");
const voidreason = require("./voidreason");
const posfile = require("./posfile");
const taxcode = require("./taxcode");
const orderitemdiscount = require("./orderitemdiscount");
const transaction = require("./transaction");
const esales = require("./esales");
const reading = require("./reading");
const xzreading = require("./xzreading");
const useractivitylog = require("./useractivitylog");
const specialrequestgroup = require("./specialrequestgroup");
const getMasterFileEndPoints = require("./getmasterfile");
const importEndPoints = require("./importmasterfile");
const exportEndPoints = require("./exportmasterfile");
const menusEndpoints = require("./menus");
const userAccessEndpoints = require("./useraccess");
const userReportEndpoints = require("./userreport");
const getDBInfoEndPoints = require("./getdbinfo");
const switchDBEndPoints = require("./switchdb");
const dbconfig = require("./dbconfig");
const clearMasterFileEndPoints = require("./clearmasterfile");
const clearTransactionEndPoints = require("./cleartransaction");
const masterFileLogEndPoints = require("./masterfilelog");
const backupDatabaseEndPoints = require("./backupdatabase");
const securityCodeEndPoints = require("./securitycode");
const getHDDSerialNumberEndPoints = require("./gethddserial");
const regenerateMallFiles = require("./regeneratemallfiles");
const downloadMasterFileEndPoints = require("./downloadmasterfile");
const syncMasterFileEndPoints = require("./syncmasterfile");
const receiptOrderFilePath = require("./receiptorderfilepath");
const getTransferFileEndPoints = require("./automationofsales/gettransferfile");
const eodAutoTransferEndPoints = require("./eodautotransfer");
const itemComboEndPoints = require("./itemcombo");
const cashIOReasonEndpoints = require("./cashioreason");
const branchFileEndpoints = require("./branchfile");
const adsEndpoints = require("./advertisement");
const masterfileDeletionValidationEndpoints = require("./masterfiledeletionvalidation");
const themeEndpoints = require("./themefile");
const mallHookupEndpoints = require("./mallhookup");
const managersReportEndpoints = require("./managers-report")
const homeInitEndpoints = require("./homeinit");
const cancelZReadingEndpoints = require("./cancelzreading");
const posorderingfileEndpoints = require('./posorderingfile');

module.exports = initEndpoints = (app, sseEmitter) => {
  // Add the controllers here to make the endpoints registered.
  
  router.use("/userFile", posUserFileEndpoints());
  router.use("/headerfile", headerfileEndpoints());
  router.use("/systemparameters", systemparametersEndpoints());
  router.use("/footer", footerEndpoints());
  router.use("/terminal", terminalEndpoints());
  router.use("/printerstation", locationfileEndpoints());
  router.use("/itemclassification", itemclassificationEndpoints());
  router.use("/itemsubclassification", itemsubclassificationEndpoints());
  router.use("/item", itemEndpoints());
  router.use("/itemcombo", itemComboEndPoints());
  router.use("/specialrequest", specialrequest());
  router.use("/cardtype", cardtype());
  router.use("/freereason", freereason());
  router.use("/otherpayment", otherpayment());
  router.use("/dinetype", dinetype());
  router.use("/discount", discount());
  router.use("/pricelist", pricelist());
  router.use("/pricedetail", pricedetail());
  router.use("/warehouse", warehouse());
  router.use("/warehousedetail", warehousedetail());
  router.use("/memc", memc());
  router.use("/company", company());
  router.use("/voidreason", voidreason());
  router.use("/posfile", posfile());
  router.use("/taxcode", taxcode());
  router.use("/orderitemdiscount", orderitemdiscount());
  router.use("/transaction", transaction());
  router.use("/esales", esales());
  router.use("/reading", reading());
  router.use("/xzreading", xzreading());
  router.use("/useractivitylog", useractivitylog());
  router.use("/specialrequestgroup", specialrequestgroup());
  router.use("/", getMasterFileEndPoints());
  router.use("/exportfile", exportEndPoints());
  router.use("/menus", menusEndpoints());
  router.use("/useraccess", userAccessEndpoints());
  router.use("/userreport", userReportEndpoints());
  router.use("/getdbinfo", getDBInfoEndPoints());
  router.use("/switchdb", switchDBEndPoints());
  router.use("/dbconfig", dbconfig());
  router.use("/clearmasterfile", clearMasterFileEndPoints());
  router.use("/cleartransaction", clearTransactionEndPoints());
  router.use("/masterfilelog", masterFileLogEndPoints());
  router.use("/backupdatabase", backupDatabaseEndPoints());
  router.use("/securitycode", securityCodeEndPoints());
  router.use("/gethddserial", getHDDSerialNumberEndPoints());
  router.use("/regeneratemallfiles", regenerateMallFiles());
  router.use("/downloadmasterfile", downloadMasterFileEndPoints());
  router.use("/syncmasterfile", syncMasterFileEndPoints());
  router.use("/receiptorderfilepath", receiptOrderFilePath());
  router.use("/gettransferfile", getTransferFileEndPoints());
  router.use("/eodautotransfer", eodAutoTransferEndPoints());
  router.use("/importfile", uploads.single("file"), importEndPoints());
  router.use("/cashioreason", cashIOReasonEndpoints());
  router.use("/branchfile", branchFileEndpoints());
  router.use("/advertisement", adsEndpoints());
  router.use("/validatemasterfiledeletion", masterfileDeletionValidationEndpoints());
  router.use("/theme", themeEndpoints());
  router.use("/mallhookup", mallHookupEndpoints(sseEmitter));
  router.use("/managers-report", managersReportEndpoints());
  router.use("/homeinit", homeInitEndpoints());
  router.use("/cancelzreading", cancelZReadingEndpoints());
  router.use("/posorderingfile", posorderingfileEndpoints());

  app.use("/api", router);
};
