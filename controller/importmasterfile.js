const {modelList} = require("../model/model");
const express = require("express");
const router = express.Router();
const {
  importFilesCode,
  importFileSecondary,
} = require("../constants/masterfiles");
const fs = require("fs");
const path = require("path");
const {dateTodayFormatter} = require("../helper/index");
const writtenNumber = require("written-number");
const converter = require("number-to-words");

module.exports.LNextS = async (xp_string) => {
  let xp_len = xp_string.length;
  let xp_result = "";
  let xp_chr = "";
  let xp_next = true;
  let xp_count = xp_len - 1;
  let xp_asc = 0;

  while (xp_count >= 0) {
    if (xp_next == true) {
      // Get the character at position xp_count in xp_string.
      xp_chr = xp_string.substr(xp_count, 1);
      // Get the ASCII code of the character.
      xp_asc = xp_chr.charCodeAt(0);

      if (xp_asc >= 48 && xp_asc <= 57) {
        // If the character is a digit (0-9), increment it.
        // Example: "9" becomes "0".
        let x = Number(xp_chr);
        x = x + 1;
        xp_chr = x.toString().substr(-1, 1);
      } else if (xp_asc >= 65 && xp_asc <= 90) {
        // If the character is an uppercase letter (A-Z), increment it.
        // Example: "A" becomes "B", "Z" becomes "A".
        if (xp_asc == 90) {
          xp_chr = String.fromCharCode(97); // Wrap from "Z" to "a".
        } else {
          xp_chr = String.fromCharCode(xp_asc + 1);
        }
        xp_next = false;
      } else if (xp_asc >= 97 && xp_asc <= 122) {
        // If the character is a lowercase letter (a-z), increment it.
        // Example: "a" becomes "b", "z" becomes "a".
        if (xp_asc == 122) {
          xp_next = true;
          xp_chr = String.fromCharCode(65); // Wrap from "z" to "A".
        } else {
          xp_chr = String.fromCharCode(xp_asc + 1);
        }
      }
      xp_result = xp_chr + xp_result;
    } else {
      // If xp_next is false, copy the remaining part of xp_string and break.
      xp_result = xp_string.substr(0, xp_count + 1) + xp_result;
      break;
    }
    xp_count = xp_count - 1;
  }
  return xp_result;
};

module.exports = importEndPoints = () => {
  let arrErrors = [];
  let arrData = [];

  const AddMessage = (message = "", line = 0, done = false) => {
    // global.socket.emit("import", {
    //   message: message,
    //   line: line,
    //   done: done,
    // });
    arrErrors.push({
      message: message,
      line: line,
    });
  };

  const validator = async (
    params = {
      value,
      type,
      allowNull,
      lineIndex,
      tabIndex,
      modelData,
      model,
      table,
      unique,
      fields,
    }
  ) => {
    // * [Re-initialized parameter to shorten variables.]
    let value = params.value;
    const type = params.type.trim();
    const allowNull = params.allowNull;
    const lineIndex = params.lineIndex;
    const tabIndex = params.tabIndex;
    let model = params.model;
    const selectedField = params.fields[tabIndex];
    const checkDuplicate = params.unique;

    console.log("xxx", selectedField);
    console.log("yyy", params);

    if (!arrData) {
      arrData = {};
    }
    if (!arrData) {
      arrData = {};
    }
    if (!arrData[lineIndex - 1]) {
      arrData[lineIndex - 1] = {};
    }
    if (!arrData[lineIndex - 1][selectedField.fieldName]) {
      arrData[lineIndex - 1][selectedField.fieldName] = "";
    }
    if (
      selectedField.fieldName === "itmclacde" &&
      params.table !== "itemclassification"
    ) {
      // * [Find: Search the corresponding item class.]
      const searchClass = itemclassfile.find((tmp) => tmp.itmcladsc === value);

      console.log("what da hel", value);
      console.log("nani", searchClass);
      if (!searchClass) {
        AddMessage(
          `${selectedField.title}(${converter.toOrdinal(
            tabIndex + 1
          )} field) not found in the database. `,
          lineIndex
        );
        arrData[lineIndex - 1][selectedField.fieldName] = undefined;
      } else {
        arrData[lineIndex - 1][selectedField.fieldName] = searchClass.itmclacde;
        value = searchClass.itmclacde;
      }
    } else if (
      (selectedField.fieldName === "itemsubclasscde" &&
        params.table !== "itemsubclassification") ||
      selectedField.fieldName === "modgrpcde"
    ) {
      // * [Find: Search the corresponding item sub class.]
      const searchSubclass = itemsubclassfile.find(
        (tmp) => tmp.itemsubclassdsc === value
      );

      if (!searchSubclass) {
        AddMessage(
          `${selectedField.title}(${converter.toOrdinal(
            tabIndex + 1
          )} field) not found in the database. `,
          lineIndex
        );
        arrData[lineIndex - 1][selectedField.fieldName] = undefined;
      } else {
        arrData[lineIndex - 1][selectedField.fieldName] =
          searchSubclass.itemsubclasscde;
        value = searchSubclass.itemsubclasscde;
      }
    } else if (
      selectedField.fieldName === "itmcomcde" &&
      params.table === "itemcombofile"
    ) {
      const searchItmcde = await modelList["item"].instance
        .GetInstance()
        .findAll({
          where: {
            itmnum: value,
          },
          raw: true,
        });

      if (searchItmcde.length === 0) {
        AddMessage(
          `${selectedField.title}(${converter.toOrdinal(
            tabIndex + 1
          )} field) not found in the database. `,
          lineIndex
        );
        arrData[lineIndex - 1][selectedField.fieldName] = undefined;
      } else {
        arrData[lineIndex - 1][selectedField.fieldName] =
          searchItmcde[0].itmcde;
        let itmcde_value = searchItmcde[0].itmcde;
        if (
          selectedField.fieldName === "itmcomcde" &&
          searchItmcde[0].chkcombo === 0
        ) {
          await modelList["item"].instance.GetInstance().update(
            {
              chkcombo: 1,
            },
            {
              where: {
                itmcde: itmcde_value,
              },
            }
          );
        }
      }
    } else if (
      selectedField.fieldName === "itmnum" &&
      params.table === "itemcombofile"
    ) {
      // * [Find: Search the corresponding item file.]
      const searchItmcde = await modelList["item"].instance
        .GetInstance()
        .findAll({
          where: {
            itmnum: value,
          },
          raw: true,
        });

      if (searchItmcde.length === 0) {
        AddMessage(
          `${selectedField.title}(${converter.toOrdinal(
            tabIndex + 1
          )} field) not found in the database. `,
          lineIndex
        );
        arrData[lineIndex - 1][selectedField.fieldName] = undefined;
      } else {
        arrData[lineIndex - 1][selectedField.fieldName] =
          searchItmcde[0].itmnum;
        arrData[lineIndex - 1]["itmcde"] = searchItmcde[0].itmcde;
      }
    } else if (
      selectedField.fieldName === "itmcderef" &&
      params.table === "itemcombofile"
    ) {
      if (value === "" || value === undefined || value === null) {
        arrData[lineIndex - 1][selectedField.fieldName] = "";
        value = "";
      } else {
        const searchItmcde = await modelList["itemcombo"].instance
          .GetInstance()
          .findAll({
            where: {
              itmnum: value,
              itmcomtyp: "DEFAULT",
            },
            raw: true,
          });

        if (searchItmcde.length === 0) {
          AddMessage(
            `${selectedField.title}(${converter.toOrdinal(
              tabIndex + 1
            )} field) not found in the database. `,
            lineIndex
          );
          arrData[lineIndex - 1][selectedField.fieldName] = undefined;
        } else {
          arrData[lineIndex - 1][selectedField.fieldName] =
            searchItmcde[0].itmcde;
          value = searchItmcde[0].itmcde;
        }
      }
    } else if (selectedField.fieldName === "memc" && params.table === "item") {
      console.log("dumaan ba rito?", selectedField.fieldName, params.table);
      if (value === "" || value === undefined || value === null) {
        arrData[lineIndex - 1][selectedField.fieldName] = "";
        value = "";
      } else {
        // * [Find: Search the corresponding MEMC.]
        const searchMemc = memcfile.find((tmp) => tmp.codedsc === value);

        console.log("bakit iba", searchMemc);

        if (!searchMemc) {
          AddMessage(
            `${selectedField.title}(${converter.toOrdinal(
              tabIndex + 1
            )} field) xxx not found in the database. `,
            lineIndex
          );
          arrData[lineIndex - 1][selectedField.fieldName] = undefined;
        } else {
          arrData[lineIndex - 1][selectedField.fieldName] = searchMemc.code;
          value = searchMemc.code;
        }
      }
    } else if (params.table === "warehousefile") {
      const headerfile = await modelList["headerfile"].instance
        .GetInstance()
        .findAll({
          raw: true,
        });
      arrData[lineIndex - 1]["brhcde"] = headerfile[0].brhcde;
      arrData[lineIndex - 1][selectedField.fieldName] = value;
    } else {
      arrData[lineIndex - 1][selectedField.fieldName] = value;

      console.log("dulo x", value);
      console.log("dulo 2", arrData[lineIndex - 1][selectedField.fieldName]);
    }

    // * [Validate: Check value type.]
    switch (type) {
      case "STRING":
      case "TEXT":
      case "CHAR":
        if ((typeof value).toUpperCase() !== "STRING") {
          AddMessage(
            `Invalid [${selectedField.title}] in [${converter.toOrdinal(
              tabIndex + 1
            )}] field it must be string type.`,
            lineIndex
          );
        }
        break;
      case "INTEGER":
      case "TINYINT":
      case "DOUBLE":
      case "FLOAT":
      case "SMALLINT":
      case "NUMBER":
      case "DECIMAL":
      case "BIGINT":
        // console.log("ha ano to", value);
        // console.log(selectedField);
        // console.log("type nya:", type);
        if (isNaN(value)) {
          AddMessage(
            `Invalid [${selectedField.title}] in [${converter.toOrdinal(
              tabIndex + 1
            )}] field it must be number type.`,
            lineIndex
          );
        }
        break;
      case "DATE":
      case "DATEONLY":
        if (value instanceof Date) {
          AddMessage(
            `Invalid type [${selectedField.title}] in [${converter.toOrdinal(
              tabIndex + 1
            )}] field it must be date type.`,
            lineIndex
          );
        }
        break;
    }

    // * [Validate: Character base on regex format pass in parameter 'regex'.]
    if (selectedField.regex) {
      for (let k = 0; k < selectedField.regex; k++) {
        if (!selectedField.regex[k].regex.test(value)) {
          AddMessage(
            `Invalid character in [${converter.toOrdinal(tabIndex + 1)}] field${
              selectedField.regex[k].title
                ? `. It must be '${selectedField.regex[1]}' format`
                : ""
            }.`,
            lineIndex
          );
        }
      }
    }

    // * [Validate: Value must be in options array if options exist in field.]
    if (params.table === "item" && selectedField.fieldName === "taxcde") {
      let options = [
        ...(await modelList["taxcode"].instance.GetInstance().findAll({
          attributes: ["taxcde"],
          raw: true,
        })),
      ].map((tax) => tax.taxcde);
      if (!options.map((e) => e.toLowerCase()).includes(value.toLowerCase())) {
        AddMessage(
          `Value must be ${options
            .filter((e, i) => i !== options.length - 1)
            .map((e) => e)
            .join(", ")} or ${options[options.length - 1]} in ${
            selectedField.title
          }(${converter.toOrdinal(tabIndex + 1)} field).`,
          lineIndex
        );
      }
    } else if (selectedField.options && !allowNull) {
      if (
        !selectedField.options
          .map((e) => e.toLowerCase())
          .includes(value.toLowerCase())
      ) {
        AddMessage(
          `Value must be ${selectedField.options
            .filter((e, i) => i !== selectedField.options.length - 1)
            .map((e) => e)
            .join(", ")} or ${
            selectedField.options[selectedField.options.length - 1]
          } in ${selectedField.title}(${converter.toOrdinal(
            tabIndex + 1
          )} field).`,
          lineIndex
        );
      }
    }

    // * [Validate: Check if value already exist in master file [Duplicate Entry].]

    // console.log("DUPLICATE TO PRI");
    // console.log("value to string", value.toString());
    // // console.log("check duplicate", checkDuplicate);
    // console.log("oy", arrData);

    if (value.toString().length > 0 && checkDuplicate) {
      await model
        .findAndCountAll({
          where: {
            [selectedField.fieldName]: value,
          },
        })
        .then((e) => {
          if (e.count > 0) {
            AddMessage(
              `Duplicate entry of ${selectedField.title}(${converter.toOrdinal(
                tabIndex + 1
              )} field) in the database.`,
              lineIndex
            );
          }
        });

      // * [Validate: Check if value already exist in file [Duplicate Entry in File].]
      arrData.forEach((data, arr_index) => {
        if (
          data[selectedField.fieldName] === value &&
          arr_index !== lineIndex - 1
        ) {
          // console.log("compare", value, "vs", data[selectedField.fieldName]);
          AddMessage(
            `Duplicate entry of ${selectedField.title}(${converter.toOrdinal(
              tabIndex + 1
            )} field) in file.`,
            lineIndex
          );
        }
      });
    }

    // // * [Validate: Value if exist in options with condition.]
    // if (selectedField.requiredIF) {
    //   if (currentRowValue) {
    //     const selectedValue =
    //       currentRowValue[
    //         fields.findIndex(
    //           (e) => e.fieldName === selectedField.requiredIF.fieldName
    //         )
    //       ];
    //     if (
    //       !selectedField.requiredIF.options.includes(selectedValue) &&
    //       !value.length > 0
    //     ) {
    //       AddMessage(
    //         `[${converter.toOrdinal(tabIndex + 1)}] field is required.`,
    //         lineIndex
    //       );
    //     }
    //   }
    // }
  };

  const importFiles = {
    dinetype: [
      {
        title: "Dine Type Code",
        fieldName: "postypcde",
      },
      {
        title: "Dine Type",
        fieldName: "postypdsc",
      },
      {
        title: "Order Type",
        fieldName: "ordertyp",
        options: ["DINEIN", "TAKEOUT"],
      },
    ],
    warehouse: [
      {
        title: "Description",
        fieldName: "wardsc",
      },
    ],
    itemclassification: [
      {
        title: "Item Classification Code",
        fieldName: "itmclacde",
      },
      {
        title: "Item Classification Description",
        fieldName: "itmcladsc",
      },
    ],
    itemsubclassification: [
      {
        title: "Item Subclassification Code",
        fieldName: "itemsubclasscde",
      },
      {
        title: "Item Subclassification Description",
        fieldName: "itemsubclassdsc",
      },
      {
        title: "Item Classification",
        fieldName: "itmclacde",
        requiredData: {
          model2: modelList["itemclassification"].instance
            .GetInstance()
            .findAll({
              raw: true,
            }),
          model: "itemsubclassfile",
          field: "itmclacde",
        },
      },
    ],
    item: [
      {
        title: "Item Code",
        fieldName: "itmcde",
      },
      {
        title: "Item Description",
        fieldName: "itmdsc",
      },
      {
        title: "Item Description (Short)",
        fieldName: "itmdscshort",
      },
      {
        title: "Item Number",
        fieldName: "itmnum",
      },
      {
        title: "Foreign Description",
        fieldName: "itmdscforeign",
      },
      {
        title: "Item Type",
        fieldName: "itmtyp",
        options: ["INVENTORY", "NON-INVENTORY", "CHARGES", "SERVICE"],
      },
      {
        title: "Item Classification",
        fieldName: "itmclacde",
        requiredData: {
          model2: modelList["itemclassification"].instance
            .GetInstance()
            .findAll({
              raw: true,
            }),
          model: "itemfile",
          field: "itmclacde",
        },
      },
      {
        title: "Item Subclassification",
        fieldName: "itemsubclasscde",
        requiredData: {
          model2: modelList["itemsubclassification"].instance
            .GetInstance()
            .findAll({
              raw: true,
            }),
          model: "itemfile",
          field: "itemsubclasscde",
        },
      },
      {
        title: "Barcode",
        fieldName: "barcde",
      },
      {
        title: "Unit of Measure",
        fieldName: "untmea",
        options: ["PCS"],
      },
      {
        title: "Unit Cost",
        fieldName: "untcst",
      },
      {
        title: "Selling Price",
        fieldName: "untprc",
      },
      {
        title: "Re-Order Level",
        fieldName: "crilvl",
      },
      {
        title: "MEMC",
        fieldName: "memc",
        requiredData: {
          model2: modelList["memc"].instance.GetInstance().findAll({
            raw: true,
          }),
          model: "memcfile",
          field: "codedsc",
        },
      },
      {
        title: "Tax Code",
        fieldName: "taxcde",
        options: ["VAT 0 RATED", "VAT EXEMPT", "VATABLE"],
      },
    ],
    itemcombo: [
      {
        title: "Item Combo No. (Item no. of Combo item)",
        fieldName: "itmcomcde",
        requiredData: {
          model2: modelList["item"].instance.GetInstance().findAll({
            raw: true,
          }),
          model: "itemcombofile",
          field: "itmnum",
        },
      },
      {
        title: "Item No. (Item no. of item to be added in combo)",
        fieldName: "itmnum",
        requiredData: {
          model2: modelList["item"].instance.GetInstance().findAll({
            raw: true,
          }),
          model: "itemcombofile",
          field: "itmnum",
        },
      },
      {
        title: "COMBO TYPE",
        fieldName: "itmcomtyp",
        options: ["DEFAULT", "OTHERS", "UPGRADE"],
      },
      {
        title: "Item Description (Item name of item to be added in combo)",
        fieldName: "itmdsc",
      },
      {
        title: "Unit of Measure",
        fieldName: "untmea",
        options: ["PCS"],
      },
      {
        title: "Upgrade Price",
        fieldName: "upgprc",
      },
      {
        title: "Item No. of Default Item to Upgrade",
        fieldName: "itmcderef",
      },
    ],
    specialrequest: [
      {
        title: "Special Request Code",
        fieldName: "modcde",
      },
      {
        title: "Item Subclass",
        fieldName: "modgrpcde",
        requiredData: {
          model2: modelList["itemsubclassification"].instance
            .GetInstance()
            .findAll({
              raw: true,
            }),
          model: "modifierfile",
          field: "itemsubclasscde",
        },
      },
    ],
    discount: [
      {
        title: "Discount Check POS",
        fieldName: "chkpos",
      },
      {
        title: "Discount Code",
        fieldName: "discde",
      },
      {
        title: "Discount Description",
        fieldName: "disdsc",
      },
      {
        title: "Discount Type",
        fieldName: "distyp",
        // options: ["Percent", "Amount"],
      },
      {
        title: "Discount Amount",
        fieldName: "disamt",
      },
      {
        title: "Discount Percentage",
        fieldName: "disper",
      },

      {
        title: "Discount Vat Exempt",
        fieldName: "exemptvat",
        // options: ["Y", "N"],
      },
      {
        title: "Discount Less Vat Discount",
        fieldName: "nolessvat",
      },
      {
        title: "Discount With Service Charge",
        fieldName: "scharge",
      },
      {
        title: "Discount Government Discount",
        fieldName: "govdisc",
      },
      {
        title: "Discount Mall Discount",
        fieldName: "hookupdisc",
      },
      {
        title: "Discount Online Deals",
        fieldName: "online_deals",
      },
    ],
    memc: [
      {
        title: "MEMC Code",
        fieldName: "codedsc",
      },
      {
        title: "MEMC Code Description",
        fieldName: "codedsc",
      },
      {
        title: "MEMC Value",
        fieldName: "value",
      },
    ],
    voidreason: [
      {
        title: "Void Reason",
        fieldName: "voidcde",
      },
    ],
    cardtype: [
      {
        title: "Card Type",
        fieldName: "cardtype",
      },
    ],
    freereason: [
      {
        title: "Free Reason",
        fieldName: "freereason",
      },
    ],
    otherpayment: [
      {
        title: "Other Payment Type",
        fieldName: "paytyp",
      },
    ],
  };

  // const storage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     return cb(null, "./public/Images");
  //   },
  //   filename: function (req, file, cb) {
  //     return cb(null, `${file.originalname}`);
  //   },
  // });

  // const upload = multer({storage});

  // try {
  //   console.log("succeess");
  //   res.status(200).json({msg: "success", body : req.body});
  // } catch (error) {
  //   console.log(error);
  //   res.status(200).json({msg: "error"});
  // }

  router.post("/", async (req, res) => {
    try {
      if (req.file.filename) {
        // clear();
        arrErrors = [];
        const isUtf8file = req.query["isUtf8file"] === "true" ? true : false;
        let buf = "";
        const result = await modelList["systemparameters"].instance
          .GetInstance()
          .findOne({
            raw: true,
          });
        let selectedPath = "";
        // manipulate string based on pathfile in settings
        switch (req.body.type) {
          case "ej":
            selectedPath += result.ej_pathfile
              ? `${result.ej_pathfile}/ej/${dateTodayFormatter()}/${
                  req.file.filename
                }`
              : `./uploads/ej/${dateTodayFormatter()}/${req.file.filename}`;
            break;
          case "stickerprint":
            selectedPath += result.sticker_path
              ? `${result.sticker_path}/${req.file.filename}`
              : `./uploads/stickerprint/${dateTodayFormatter()}/${
                  req.file.filename
                }`;
            break;
          default:
            selectedPath += result.ej_pathfile
              ? `${result.ej_pathfile}/uploads/${req.file.filename}`
              : `./uploads/${req.file.filename}`;
            break;
        }

        if (isUtf8file) {
          buf = fs.readFileSync(path.resolve(selectedPath), "utf16le");
        } else {
          buf = fs.readFileSync(path.resolve(selectedPath));
        }

        const isFirstLineHeader =
          req.query["isFirstLineHeader"] === "true" ? true : false;
        const selectedImport = req.query["selectedImported"];
        const fields = importFiles[selectedImport];

        const model = modelList[selectedImport].instance.GetInstance();
        itemclassfile = await modelList["itemclassification"].instance
          .GetInstance()
          .findAll({
            raw: true,
          });

        itemsubclassfile = await modelList["itemsubclassification"].instance
          .GetInstance()
          .findAll({
            raw: true,
          });
        memcfile = await modelList["memc"].instance.GetInstance().findAll({
          raw: true,
        });
        const modelData = await model.findAndCountAll();
        const stringBuf = buf.toString();
        const textfileData = stringBuf.split("\r\n");

        let tableData = [];
        const initialHeader = "A";
        textfileData.forEach(async (row, index) => {
          // onGoingMessage(`Processing Data`, index + 1);
          let dataObject = {};
          let initialHeaderChar = initialHeader.charCodeAt(0);
          const tabDelimited = row.split("\t");
          tabDelimited.forEach(async (col, col_indx) => {
            dataObject[String.fromCharCode(initialHeaderChar)] = col;
            initialHeaderChar++;
          });
          tableData.push(dataObject);
        });

        if (isFirstLineHeader) {
          tableData.shift();
        }

        if (tableData.length > 0) {
          let fieldctrRequired = 0;
          const funcCheckField = new Promise((resolve) => {
            // onGoingMessage(`Checking Field Structure`, 0);
            fieldctrRequired = fields.length;
            resolve();
          });
          funcCheckField.then(() => {
            let checker_indx = 0;
            while (checker_indx < tableData.length) {
              console.log("takbo");
              // onGoingMessage(
              //   `Validating Field Structure`,
              //   isFirstLineHeader ? checker_indx + 2 : checker_indx + 1
              // );

              console.log(
                fieldctrRequired,
                "vs",
                Object.keys(tableData[checker_indx]).length
              );
              console.log(Object.keys(tableData[checker_indx]));
              if (
                Object.keys(tableData[checker_indx]).length != fieldctrRequired
              ) {
                AddMessage(
                  `Column count did not match. It must be ${writtenNumber(
                    fieldctrRequired
                  )} field(s).`,
                  isFirstLineHeader ? checker_indx + 2 : checker_indx + 1,
                  true
                );
                checker_indx++;
              } else {
                checker_indx++;
              }
            }
            console.error("ERRORS", arrErrors);
            if (arrErrors.length == 0) {
              console.log("no errors");
              const func = new Promise((resolve) => {
                tableData.map(async (line, lineIndex) => {
                  // onGoingMessage(
                  //   `Validating Data`,
                  //   isFirstLineHeader ? lineIndex + 2 : lineIndex + 1
                  // );
                  const currentRowValue = Object.values(line);
                  for (
                    let tabIndex = 0;
                    tabIndex < currentRowValue.length;
                    tabIndex++
                  ) {
                    const tab = currentRowValue[tabIndex];
                    const type =
                      model.tableAttributes[fields[tabIndex].fieldName].type
                        .constructor.key;
                    const length =
                      model.tableAttributes[fields[tabIndex].fieldName].type
                        ._length;
                    const allowNull =
                      model.tableAttributes[fields[tabIndex].fieldName]
                        .allowNull;
                    // const unique =
                    // model.tableAttributes[fields[tabIndex].fieldName]
                    // .fieldName;
                    // ? model.tableAttributes[fields[tabIndex].fieldName].unique
                    // : model.tableAttributes[fields[tabIndex].fieldName]
                    //     .primaryKey;

                    const unique = model.tableAttributes[
                      fields[tabIndex].fieldName
                    ].unique
                      ? model.tableAttributes[fields[tabIndex].fieldName].unique
                      : model.tableAttributes[fields[tabIndex].fieldName]
                          .primaryKey;

                    console.log("mga pinasa", selectedImport);
                    console.log("tabular", tab);

                    await validator({
                      value: tab,
                      type: type,
                      allowNull: allowNull,
                      lineIndex: isFirstLineHeader
                        ? lineIndex + 2
                        : lineIndex + 1,
                      tabIndex: tabIndex,
                      modelData: modelData,
                      model: model,
                      table: selectedImport,
                      unique: unique,
                      fields: fields,
                    });
                  }
                  if (lineIndex + 1 == tableData.length) {
                    resolve();
                  }
                });
              });
              func.then(async () => {
                if (arrErrors.length > 0) {
                  console.log("ikaw ba");
                  console.log(arrErrors);
                  // res.send(arrErrors);
                  // res.status(409).json({msg: "Duplicate", errors:  arrErrors});
                  res.status(409).json({
                    status: "error",
                    msg: "Duplicate Error: Imported Values Already Exists. ",
                    errors: arrErrors,
                  });
                  AddMessage("", 0, true);
                  arrData = [];
                } else {
                  arrData = await Promise.all(arrData.filter((e) => e != null));
                  if (importFilesCode.hasOwnProperty(selectedImport)) {
                    const importSource = importFilesCode[selectedImport];
                    let initIndex = 0;
                    while (initIndex < arrData.length) {
                      console.log("takbo 2");

                      let arrRecord = arrData[initIndex];
                      // onGoingMessage(
                      //   `Inserting Data`,
                      //   isFirstLineHeader ? initIndex + 2 : initIndex + 1
                      // );
                      const sysparfile = await modelList[
                        "systemparameters"
                      ].instance
                        .GetInstance()
                        .findAll({
                          // Select the specific record
                          attributes: [`${importSource.primarySource}`],
                          raw: true,
                        });
                      let pkeyNum = sysparfile[0][importSource.primarySource]; // Get the primary key number
                      arrRecord[`${importSource.primary}`] = pkeyNum;
                      const createResult = await model
                        .create(arrRecord)
                        .then((e) => e)
                        .catch((err) => {
                          console.error("Error in saving ... ", err);
                          console.log("wat da hek", arrErrors);
                          console.log(err);
                          arrErrors.push(err);
                        }); // Create new record
                      if (createResult) {
                        const nextSeries = await this.LNextS(pkeyNum).then(
                          (e) => e
                        ); // Generate the new primary key number
                        if (nextSeries) {
                          let update_params = {};
                          update_params[importSource.primarySource] =
                            nextSeries; // Create a update parameter
                          await modelList["systemparameters"].instance
                            .GetInstance()
                            .update(update_params, {
                              where: {
                                recid: 1,
                              },
                            })
                            .then(() => {
                              initIndex++; // Increment the initial index
                              if (initIndex === arrData.length) {
                                console.log("success");
                                AddMessage("Imported successfully.", 0, true);
                                arrData = [];
                                res.status(200).json({
                                  status: "success",
                                });
                              }
                            })
                            .catch((err) => {
                              console.log("oops mali na bago");
                              console.error(err);
                            }); // Create new record
                        }
                      } else if (arrErrors.length > 0) {
                        console.log("mga mali", arrErrors);
                        return res.status(409).json({
                          status: "error",
                          msg: "Duplicate Error: Imported Values Already Exists. ",
                        });
                      }
                    }
                  } else if (
                    importFileSecondary.hasOwnProperty(selectedImport) &&
                    selectedImport !== "specialrequest"
                  ) {
                    console.log("ano nanaman to", selectedImport);
                    const importSecondary = importFileSecondary[selectedImport];

                    console.log("ha ano to", importSecondary);
                    let initIndex = 0;
                    while (initIndex < arrData.length) {
                      console.log("takbo 3");
                      let arrRecord = arrData[initIndex];
                      // onGoingMessage(
                      // `Inserting Data`,
                      // isFirstLineHeader ? initIndex + 2 : initIndex + 1
                      // );
                      const createResult = await model
                        .create(arrRecord)
                        .then((e) => e)
                        .catch((err) => {
                          console.log("oops mali 1");
                          console.error(err);
                          arrErrors.push(value);
                        }); // Create new record
                      if (createResult) {
                        let fieldIndex = 0;
                        let secondaryData_obj = {};
                        while (
                          fieldIndex <
                          importSecondary["secondTableField"].length
                        ) {
                          const field_object =
                            importSecondary["secondTableField"][fieldIndex];
                          secondaryData_obj[field_object.fieldName] =
                            arrRecord[field_object.sourceData];
                          fieldIndex++;
                        }
                        await modelList.importSecondary[
                          "secondTableName"
                        ].instance
                          .GetInstance()
                          .create(secondaryData_obj)
                          .then((e) => {
                            initIndex++;
                            if (initIndex === arrData.length) {
                              AddMessage("Imported successfully.", 0, true);
                              arrData = [];
                              res.status(200).json({
                                status: "success",
                              });
                            }
                          })
                          .catch((err) => {
                            console.log("oops mali 2");

                            // arrErrors.push()

                            console.error(err);
                          });
                      } else if (arrErrors.length > 0) {
                        console.log("mga mali", arrErrors);
                        return res.status(409).json({
                          status: "error",
                          msg: "Duplicate Error: Imported Values Already Exists. ",
                        });
                      }
                    }
                  } else {
                    console.log("success");
                    // onGoingMessage(`Inserting Data`, 0);
                    model.bulkCreate(arrData).then(() => {
                      AddMessage("Imported successfully.", 0, true);
                      arrData = [];
                      res.status(200).json({
                        status: "success",
                      });
                    });
                  }
                }
              });
            } else {
              console.error("has error");
              arrData = [];
              res.status(400).json({
                status: "error",
                msg: arrErrors,
              });
            }
          });
        } else {
          console.error("invalid");
          AddMessage(`Invalid file`, 0, true);
          console.error(arrErrors);
          arrData = [];
          res.status(400).json({
            status: "error",
            msg: arrErrors,
          });
        }
      } else {
        res.status(400).json({msg: "No Query Provided"});
      }
    } catch (error) {
      // console.log("kamalian", error);
      arrData = [];
      res.status(400).json({
        status: "error",
        errorData: error,
      });
    }
  });

  return router;
};
