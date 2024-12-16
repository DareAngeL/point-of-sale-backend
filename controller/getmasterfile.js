const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();
const { importFiles, modelLabels } = require("../constants/masterfiles");

module.exports = getMasterFileEndPoints = () => {
  router.get("/getexporttemplate", async (req, res) => {
    const selectedImport = req.query["selectedImported"];
    const model = modelList[selectedImport].instance.GetInstance();
    const fields = importFiles[selectedImport];
    let data = "";

    for (
      let i = 0;
      i < Object.values(importFiles[selectedImport]).length;
      i++
    ) {
      const selectedField = fields[i];

      let length = model.tableAttributes[selectedField.fieldName].type._length;
      if (
        model.tableAttributes[selectedField.fieldName].type.key === "DECIMAL" ||
        model.tableAttributes[selectedField.fieldName].type.key === "NUMBER"
      ) {
        length = 18;
      }
      data += `${selectedField.title} (${length} char.)`;
      if (selectedField.title === "Tax Code") {
        data += `(value = VAT 0 RATED, VAT EXEMPT, VATABLE)`;
      } else if (selectedField.options) {
        data += `(value = ${selectedField.options.join(", ")})`;
      }

      if (!(i === Object.values(importFiles[selectedImport]).length - 1)) {
        data += "\t";
      }
    }

    res.status(200).send(data);
  });

  router.get("/getmasterfile", async (req, res) => {
    res.send(modelLabels);
  });

  return router;
};
