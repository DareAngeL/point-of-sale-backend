const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();
const {importFiles} = require("../constants/masterfiles");

module.exports = exportEndPoints = () => {
  // const importFiles = {
  //   dinetype: [
  //     {
  //       title: "Dine Type",
  //       fieldName: "postypdsc",
  //     },
  //     {
  //       title: "Order Type",
  //       fieldName: "ordertyp",
  //       options: ["DINEIN", "TAKEOUT"],
  //     },
  //   ],
  //   warehouse: [
  //     {
  //       title: "Description",
  //       fieldName: "wardsc",
  //     },
  //   ],
  //   itemclassification: [
  //     {
  //       title: "Item Classification",
  //       fieldName: "itmcladsc",
  //     },
  //   ],
  //   itemsubclassification: [
  //     {
  //       title: "Item Subclassification",
  //       fieldName: "itemsubclassdsc",
  //     },
  //     {
  //       title: "Item Classification",
  //       fieldName: "itmclacde",
  //       requiredData: {
  //         model2: modelList.itemclassification.instance.GetInstance().findAll({
  //           raw: true,
  //         }),
  //         model: "itemsubclassfile",
  //         field: "itmclacde",
  //       },
  //     },
  //   ],
  //   item: [
  //     {
  //       title: "Description",
  //       fieldName: "itmdsc",
  //     },
  //     {
  //       title: "Description (Short)",
  //       fieldName: "itmdscshort",
  //     },
  //     {
  //       title: "Item Number",
  //       fieldName: "itmnum",
  //     },
  //     {
  //       title: "Foreign Description",
  //       fieldName: "itmdscforeign",
  //     },
  //     {
  //       title: "Item Type",
  //       fieldName: "itmtyp",
  //       options: ["INVENTORY", "NON-INVENTORY", "CHARGES", "SERVICE"],
  //     },
  //     {
  //       title: "Item Classification",
  //       fieldName: "itmclacde",
  //       requiredData: {
  //         model2: modelList.itemclassification.instance.GetInstance().findAll({
  //           raw: true,
  //         }),
  //         model: "itemfile",
  //         field: "itmclacde",
  //       },
  //     },
  //     {
  //       title: "Item Subclassification",
  //       fieldName: "itemsubclasscde",
  //       requiredData: {
  //         model2: modelList.itemsubclassification.instance
  //           .GetInstance()
  //           .findAll({
  //             raw: true,
  //           }),
  //         model: "itemfile",
  //         field: "itemsubclasscde",
  //       },
  //     },
  //     {
  //       title: "Barcode",
  //       fieldName: "barcde",
  //     },
  //     {
  //       title: "Unit of Measure",
  //       fieldName: "untmea",
  //       options: ["PCS"],
  //     },
  //     {
  //       title: "Unit Cost",
  //       fieldName: "untcst",
  //     },
  //     {
  //       title: "Selling Price",
  //       fieldName: "untprc",
  //     },
  //     {
  //       title: "Re-Order Level",
  //       fieldName: "crilvl",
  //     },
  //     {
  //       title: "MEMC",
  //       fieldName: "memc",
  //       requiredData: {
  //         model2: modelList.memc.instance.GetInstance().findAll({
  //           raw: true,
  //         }),
  //         model: "memcfile",
  //         field: "code",
  //       },
  //     },
  //     {
  //       title: "Tax Code",
  //       fieldName: "taxcde",
  //       options: [],
  //     },
  //   ],
  //   itemcombo: [
  //     {
  //       title: "Item Combo No. (Item no. of Combo item)",
  //       fieldName: "itmcomcde",
  //       requiredData: {
  //         model2: modelList.item.instance.GetInstance().findAll({
  //           raw: true,
  //         }),
  //         model: "itemcombofile",
  //         field: "itmnum",
  //       },
  //     },
  //     {
  //       title: "Item No. (Item no. of item to be added in combo)",
  //       fieldName: "itmnum",
  //       requiredData: {
  //         model2: modelList.item.instance.GetInstance().findAll({
  //           raw: true,
  //         }),
  //         model: "itemcombofile",
  //         field: "itmnum",
  //       },
  //     },
  //     {
  //       title: "COMBO TYPE",
  //       fieldName: "itmcomtyp",
  //       options: ["DEFAULT", "OTHERS", "UPGRADE"],
  //     },
  //     {
  //       title: "Item Description (Item name of item to be added in combo)",
  //       fieldName: "itmdsc",
  //     },
  //     {
  //       title: "Unit of Measure",
  //       fieldName: "untmea",
  //       options: ["PCS"],
  //     },
  //     {
  //       title: "Upgrade Price",
  //       fieldName: "upgprc",
  //     },
  //     {
  //       title: "Item No. of Default Item to Upgrade",
  //       fieldName: "itmcderef",
  //     },
  //   ],
  //   specialrequest: [
  //     {
  //       title: "Special Request Code",
  //       fieldName: "modcde",
  //     },
  //     {
  //       title: "Item Subclass",
  //       fieldName: "modgrpcde",
  //       requiredData: {
  //         model2: modelList.itemsubclassification.instance
  //           .GetInstance()
  //           .findAll({
  //             raw: true,
  //           }),
  //         model: "modifierfile",
  //         field: "itemsubclasscde",
  //       },
  //     },
  //   ],
  //   discount: [
  //     {
  //       title: "Discount Code",
  //       fieldName: "discde",
  //     },
  //     {
  //       title: "Description",
  //       fieldName: "disdsc",
  //     },
  //     {
  //       title: "Discount Type",
  //       fieldName: "distyp",
  //       options: ["Percent", "Amount"],
  //     },
  //     {
  //       title: "Percentage",
  //       fieldName: "disper",
  //     },
  //     {
  //       title: "Amount",
  //       fieldName: "disamt",
  //     },
  //     {
  //       title: "Vat Exempt",
  //       fieldName: "exemptvat",
  //       options: ["Y", "N"],
  //     },
  //   ],
  //   memc: [
  //     {
  //       title: "MEMC Code",
  //       fieldName: "codedsc",
  //     },
  //     {
  //       title: "MEMC Value",
  //       fieldName: "value",
  //     },
  //   ],
  //   voidreason: [
  //     {
  //       title: "Void Reason",
  //       fieldName: "voidcde",
  //     },
  //   ],
  //   cardtype: [
  //     {
  //       title: "Card Type",
  //       fieldName: "cardtype",
  //     },
  //   ],
  //   freereason: [
  //     {
  //       title: "Free Reason",
  //       fieldName: "freereason",
  //     },
  //   ],
  //   otherpayment: [
  //     {
  //       title: "Payment Type",
  //       fieldName: "paytyp",
  //     },
  //   ],
  // };

  router.get("/", async (req, res) => {
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
        model.tableAttributes[selectedField.fieldName].type.key === "DECIMAL"
      ) {
        length = 18;
      }
      data += `${selectedField.title} (${length} char.)`;
      if (selectedField.options) {
        data += `(value = ${selectedField.options.join(", ")})`;
      }

      if (!(i === Object.values(importFiles[selectedImport]).length - 1)) {
        data += "\t";
      }
    }
    const itemclass = await modelList.itemclassification.instance
      .GetInstance()
      .findAll({
        raw: true,
      });
    const itemsubclass = await modelList.itemsubclassification.instance
      .GetInstance()
      .findAll({
        raw: true,
      });

    const export_data = await model.findAll({
      attributes: {
        exclude: ["recid"],
      },
      raw: true,
    });

    data += "\n";

    let string_type = ["postrmno"];

    for (let i = 0; i < export_data.length; i++) {
      for await (let table_info of fields) {
        let column_value = export_data[i][table_info.fieldName];
        const funcData = (table_info, column_value, string_type) => {
          if (string_type.indexOf(table_info.fieldName) !== -1) {
            return column_value === null || column_value === ""
              ? ""
              : `'${column_value}`;
          } else {
            return column_value === null || column_value === ""
              ? ""
              : column_value;
          }
        };
        if (table_info.fieldName === "itmclacde") {
          let itemclassres = itemclass.find(
            (e) => e.itmclacde === column_value
          );
          data += funcData(table_info, itemclassres.itmcladsc, string_type);
        } else if (table_info.fieldName === "itemsubclasscde") {
          let itemsubclassres = itemsubclass.find(
            (e) => e.itemsubclasscde === column_value
          );
          data += funcData(
            table_info,
            itemsubclassres.itemsubclassdsc,
            string_type
          );
        } else {
          data += funcData(table_info, column_value, string_type);
        }

        data += "\t"; // New tab
      }
      data += "\n"; // New line
    }

    res.status(200).send(data);
  });

  return router;
};
