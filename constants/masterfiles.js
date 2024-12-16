const { modelList } = require("../model/model");

module.exports.importFiles = {
  dinetype: [
    {
      title: "Dine Type Code",
      fieldName: "postypcde",
    },
    {
      title: "Dine Type Description",
      fieldName: "postypdsc",
    },
    {
      title: "Order Type",
      fieldName: "ordertyp",
      options: ["DINEIN", "TAKEOUT"],
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
        model2: modelList.itemclassification.instance.GetInstance().findAll({
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
        model2: modelList.itemclassification.instance.GetInstance().findAll({
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
        model2: modelList.itemsubclassification.instance.GetInstance().findAll({
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
        model2: modelList.memc.instance.GetInstance().findAll({
          raw: true,
        }),
        model: "memcfile",
        field: "code",
      },
    },
    {
      title: "Tax Code",
      fieldName: "taxcde",
      options: [],
    },
  ],
  itemcombo: [
    {
      title: "Item Combo No. (Item no. of Combo item)",
      fieldName: "itmcomcde",
      requiredData: {
        model2: modelList.item.instance.GetInstance().findAll({
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
        model2: modelList.item.instance.GetInstance().findAll({
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
        model2: modelList.itemsubclassification.instance.GetInstance().findAll({
          raw: true,
        }),
        model: "modifierfile",
        field: "itemsubclasscde",
      },
    },
  ],
  discount: [
    {
      title: "Discount Code",
      fieldName: "discde",
    },
    {
      title: "Description",
      fieldName: "disdsc",
    },
    {
      title: "Discount Type",
      fieldName: "distyp",
      options: ["Percent", "Amount"],
    },
    {
      title: "Percentage",
      fieldName: "disper",
    },
    {
      title: "Amount",
      fieldName: "disamt",
    },
    {
      title: "Vat Exempt",
      fieldName: "exemptvat",
      options: ["Y", "N"],
    },
  ],
  memc: [
    {
      title: "MEMC Code",
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
      title: "Payment Type",
      fieldName: "paytyp",
    },
  ],
};

module.exports.modelLabels = {
  dinetype: "Dine Type",
  warehouse: "Warehouse",
  itemclassification: "Item Classifications",
  itemsubclassification: "Item Subclassifications",
  item: "Items",
  itemcombo: "Item Combo",
  specialrequest: "Special Requests",
  voidreason: "Void Reasons",
  discount: "Discounts",
  cardtype: "Card Types",
  memc: "MEMC",
  freereason: "Free Reasons",
  otherpayment: "Other Payment Types",
};

module.exports.importFilesCode = {
  memc: {
    primary: "code",
    primarySource: "memcnum",
  },
  item: {
    primary: "itmcde",
    primarySource: "itmcdedocnum",
  },
  warehouse: {
    primary: "warcde",
    primarySource: "warehousenum",
  },
  dinetype: {
    primary: "postypcde",
    primarySource: "dinetypenum",
  },
  itemclassification: {
    primary: "itmclacde",
    primarySource: "itmclanum",
  },
  itemsubclassification: {
    primary: "itemsubclasscde",
    primarySource: "itmsubclanum",
  },
};

module.exports.importFileSecondary = {
  specialrequest: {
    secondTableName: "specialrequestgroup",
    secondTableField: [
      {
        fieldName: "modcde",
        sourceData: "modcde",
      },
      {
        fieldName: "modgrpcde",
        sourceData: "modgrpcde",
      },
    ],
  },
  item: {
    secondTableName: "itemperunit",
    secondTableField: [
      {
        fieldName: "itmcde",
        sourceData: "itmcde",
      },
      {
        fieldName: "untmea",
        sourceData: "untmea",
      },
      {
        fieldName: "untcst",
        sourceData: "untcst",
      },
      {
        fieldName: "groprc",
        sourceData: "untprc",
      },
      {
        fieldName: "untprc",
        sourceData: "untprc",
      },
      {
        fieldName: "salcur",
        sourceData: "salcur",
      },
      {
        fieldName: "purcur",
        sourceData: "purcur",
      },
      {
        fieldName: "barcde",
        sourceData: "barcde",
      },
    ],
  },
};
