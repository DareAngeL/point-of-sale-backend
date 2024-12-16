const {format, sub} = require("date-fns");

const { where, fn, col } = require("sequelize");

function idFormatter(num, padstart) {
  const formattedString = String(num).padStart(padstart || 5, "0");
  return formattedString;
}

function timeTodayFormatter() {
  const currentDate = new Date();

  return format(currentDate, "HH:mm:ss")
}

function dateTodayFormatter() {
  const currentDate = new Date();

  return format(currentDate, "yyyy-MM-dd");
}

function dateFormatter(date, _format) {
  const formattedDate = new Date(date);

  // format only if valid date
  if (isNaN(formattedDate.getTime())) {
    return null;
  }

  return format(formattedDate, _format || "yyyy-MM-dd");
}

function dateSubtractionFormatter(date, days) {
  if (date === '')
    return date;

  return format(sub(new Date(date), {days: days}), "yyyy-MM-dd");
}

function dateTimeTodayFormatter() {
  const currentDate = new Date();

  return format(currentDate, "yyyy-MM-dd HH:mm:ss");
}

function LNextsCentral(xstring, xprefix, xincrement) {
  const xfield_increment = Number(xstring.match(/\d+/g)) + 1;
  xinc_code = `${xprefix}-${"0".repeat(
    xincrement - xfield_increment.toString().length
  )}${xfield_increment}`;
  return xinc_code;
}

function NewTrnCode(xcode, xbrhcde, xpostrmno) {
  if (xbrhcde != "ALL") {
    xbrhcde = Number(xbrhcde.match(/\d+/g));
    xpostrmno = Number(xpostrmno);
    xnew_code = `${xcode}-${"0".repeat(
      4 - xbrhcde.toString.length
    )}${xbrhcde}-${"0".repeat(2 - xpostrmno.toString.length)}${xpostrmno}`;
  } else {
    xnew_code = `${xcode}-ALL-${"0".repeat(
      2 - xpostrmno.toString.length
    )}${xpostrmno}`;
  }

  return xcode === null
    ? xcode
    : xcode.match(/-/gi).length > 1
    ? xcode
    : xnew_code;
}

async function convertToAccounting_new_v2(record, posfileDiscount) {
  const { modelList } = require("../model/model");

  let vatadj = 0;
  let discount = 0;
  let x_regdiscount = 0;
  let vatamt = 0;
  let netvatamt = 0;
  const discount_res = posfileDiscount.filter(
    (e) => e.ordocnum === record.ordocnum && e.postrntyp === "DISCOUNT"
  );
  let disc_count = 0;
  let disper = 0;
  let discountinfo;
  let iteminfo_arr = [];

  /* Variable for Accounting */
  let itemVatAmt = 0;
  let itemVatAdj = 0;
  let itemAmtDis = 0;
  let itemNetVatAmt = 0;
  let itemQty = 0;
  let itemDiscount = [];
  let itemExtprc = 0;
  let itemTaxCde;
  let itemUntPrc = 0;
  let itemGroPrc = 0;
  let itemGroExt = 0;
  let itemVatRte = 0;
  if (discount_res.length > 0) {
    
    let orderitemdiscount;
    if (!modelList || !modelList.orderitemdiscount) {
      orderitemdiscount = {count: 0}
    } else {
      orderitemdiscount = await modelList.orderitemdiscount.instance
      .GetInstance()
      .findAndCountAll({
        where: {
          ordercde: record.ordercde,
          itmcde: record.itmcde,
          orderitmid: record.orderitmid,
        },
        raw: true,
      });
    }

    if (orderitemdiscount.count > 0) {
      // DISCOUNT PER ITEM
      discountinfo = orderitemdiscount.rows;
      if (orderitemdiscount.rows[0].exemptvat === "Y") {
        if (record.ordertyp === "DINEIN") {
          /* For Accounting */
          itemDiscount = orderitemdiscount.rows;
          itemTaxCde = "VAT EXEMPT";
          itemAmtDis = orderitemdiscount.rows[0].amtdis;
          itemNetVatAmt = orderitemdiscount.rows[0].salwoutvat;
          itemQty = record.itmqty;
          itemUntPrc = record.groprc;
          itemGroPrc = record.groprc;
          itemGroExt = record.groprc;
          /* For Accounting */

          if (record.taxcde === "VATABLE") {
            itemVatAdj = orderitemdiscount.rows[0].lessvatadj;
            itemExtprc = itemNetVatAmt - itemAmtDis;
          } else {
            itemExtprc = itemNetVatAmt - itemAmtDis;
          }

          const item_info = {
            itemVatAdj: itemVatAdj,
            itemAmtDis: itemAmtDis,
            itemNetVatAmt: itemNetVatAmt,
            itemVatAmt: itemVatAmt,
            itemQty: itemQty,
            itemCode: record.itmcde,
            itemDesc: record["itemfile.itmdsc"],
            itemUntMea: record["itemfile.untmea"],
            itemDiscInfo: itemDiscount,
            itemExtprc: itemExtprc,
            itemTaxCde: itemTaxCde,
            itemUntPrc: itemUntPrc,
            itemBarcde: record["itemfile.barcde"],
            itemGroPrc: itemGroPrc,
            itemGroExt: itemGroExt,
            itemVatRte: itemVatRte,
          };
          iteminfo_arr.push(item_info);
        } else {
          if (
            record.memc !== "" &&
            record.memc !== null &&
            record.memc !== undefined
          ) {
            const ordermemc = await modelList.memc.instance
              .GetInstance()
              .findAndCountAll({
                where: {
                  code: record.memc,
                },
              });

            if (
              ordermemc.count > 0 &&
              ordermemc.rows[0].value < record.untprc
            ) {
              const totalMemc = ordermemc.rows[0].value * record.itmqty;
              const totalMemcNetVat = totalMemc / (1 + record.vatrte / 100);

              if (record.taxcde === "VATABLE") {
                let initIndex = 0,
                  endIndex = 2;
                while (initIndex < endIndex) {
                  itemVatAmt = 0;
                  itemVatAdj = 0;
                  itemAmtDis = 0;
                  itemNetVatAmt = 0;
                  itemQty = 0;
                  itemDiscount = [];
                  itemExtprc = 0;
                  itemTaxCde;
                  itemUntPrc = 0;
                  itemGroPrc = 0;
                  itemGroExt = 0;
                  itemVatRte = 0;

                  itemQty = Number(record.itmqty) / endIndex;

                  if (initIndex === 0) {
                    // Only the first loop will get the discount
                    itemVatAdj = orderitemdiscount.rows[0].lessvatadj;
                    itemAmtDis = orderitemdiscount.rows[0].amtdis;
                    itemDiscount = orderitemdiscount.rows;
                    itemNetVatAmt = totalMemcNetVat;
                    itemExtprc = itemNetVatAmt - itemAmtDis;
                    itemTaxCde = "VAT EXEMPT";
                    itemUntPrc = totalMemc;
                    itemGroPrc = totalMemc;
                    itemGroExt = totalMemc;
                  } else {
                    itemNetVatAmt =
                      (record.groprc - totalMemc) / (1 + record.vatrte / 100);
                    itemVatAmt = record.groprc - totalMemc - itemNetVatAmt;
                    itemExtprc = record.extprc - totalMemc;
                    itemTaxCde = "SAL VAT";
                    itemVatRte = record.vatrte;
                    itemUntPrc = record.groprc - totalMemc;
                    itemGroPrc = record.groprc - totalMemc;
                    itemGroExt = record.groprc - totalMemc;
                  }

                  const item_info = {
                    itemVatAdj: itemVatAdj,
                    itemAmtDis: itemAmtDis,
                    itemNetVatAmt: itemNetVatAmt,
                    itemVatAmt: itemVatAmt,
                    itemQty: itemQty,
                    itemCode: record.itmcde,
                    itemDesc: record["itemfile.itmdsc"],
                    itemUntMea: record["itemfile.untmea"],
                    itemDiscInfo: itemDiscount,
                    itemExtprc: itemExtprc,
                    itemTaxCde: itemTaxCde,
                    itemUntPrc: itemUntPrc,
                    itemBarcde: record["itemfile.barcde"],
                    itemGroPrc: itemGroPrc,
                    itemGroExt: itemGroExt,
                    itemVatRte: itemVatRte,
                  };
                  iteminfo_arr.push(item_info);
                  initIndex++;
                }
              } else {
                let initIndex = 0,
                  endIndex = 2;
                while (initIndex < endIndex) {
                  itemVatAmt = 0;
                  itemVatAdj = 0;
                  itemAmtDis = 0;
                  itemNetVatAmt = 0;
                  itemQty = 0;
                  itemDiscount = [];
                  itemExtprc = 0;
                  itemTaxCde;
                  itemUntPrc = 0;
                  itemGroPrc = 0;
                  itemGroExt = 0;
                  itemVatRte = 0;

                  itemQty = Number(record.itmqty) / endIndex;

                  if (initIndex === 0) {
                    // Only the first loop will get the discount
                    itemAmtDis = orderitemdiscount.rows[0].amtdis;
                    itemDiscount = orderitemdiscount.rows;
                    itemNetVatAmt = totalMemc;
                    itemExtprc = itemNetVatAmt - itemAmtDis;
                    itemTaxCde = "VAT EXEMPT";
                    itemUntPrc = totalMemc;
                    itemGroPrc = totalMemc;
                    itemGroExt = totalMemc;
                  } else {
                    itemNetVatAmt = record.extprc - totalMemc;
                    itemExtprc = record.extprc - totalMemc;
                    itemTaxCde = "VAT EXEMPT";
                    itemUntPrc = record.groprc - totalMemc;
                    itemGroPrc = record.groprc - totalMemc;
                    itemGroExt = record.groprc - totalMemc;
                  }

                  const item_info = {
                    itemVatAdj: itemVatAdj,
                    itemAmtDis: itemAmtDis,
                    itemNetVatAmt: itemNetVatAmt,
                    itemVatAmt: itemVatAmt,
                    itemQty: itemQty,
                    itemCode: record.itmcde,
                    itemDesc: record["itemfile.itmdsc"],
                    itemUntMea: record["itemfile.untmea"],
                    itemDiscInfo: itemDiscount,
                    itemExtprc: itemExtprc,
                    itemTaxCde: itemTaxCde,
                    itemUntPrc: itemUntPrc,
                    itemBarcde: record["itemfile.barcde"],
                    itemGroPrc: itemGroPrc,
                    itemGroExt: itemGroExt,
                    itemVatRte: itemVatRte,
                  };
                  iteminfo_arr.push(item_info);
                  initIndex++;
                }
              }
            } else {
              /* For Accounting */
              itemDiscount = orderitemdiscount.rows;
              itemTaxCde = "VAT EXEMPT";
              itemAmtDis = orderitemdiscount.rows[0].amtdis;
              itemNetVatAmt = orderitemdiscount.rows[0].salwoutvat;
              itemQty = record.itmqty;
              itemUntPrc = record.groprc;
              itemGroPrc = record.groprc;
              itemGroExt = record.groprc;
              /* For Accounting */

              if (record.taxcde === "VATABLE") {
                vatamt +=
                  (record.vatamt / Number(record.numpax)) *
                  (record.numpax > 1
                    ? Number(record.numpax) - Number(disc_count)
                    : 1);
                netvatamt += Number(record.netvatamt) / Number(record.numpax);

                itemVatAdj = orderitemdiscount.rows[0].lessvatadj;
                itemExtprc = itemNetVatAmt - itemAmtDis;
              } else {
                itemExtprc = itemNetVatAmt - itemAmtDis;
              }

              const item_info = {
                itemVatAdj: itemVatAdj,
                itemAmtDis: itemAmtDis,
                itemNetVatAmt: itemNetVatAmt,
                itemVatAmt: itemVatAmt,
                itemQty: itemQty,
                itemCode: record.itmcde,
                itemDesc: record["itemfile.itmdsc"],
                itemUntMea: record["itemfile.untmea"],
                itemDiscInfo: itemDiscount,
                itemExtprc: itemExtprc,
                itemTaxCde: itemTaxCde,
                itemUntPrc: itemUntPrc,
                itemBarcde: record["itemfile.barcde"],
                itemGroPrc: itemGroPrc,
                itemGroExt: itemGroExt,
                itemVatRte: itemVatRte,
              };
              iteminfo_arr.push(item_info);
            }
          } else {
            /* For Accounting */
            itemDiscount = orderitemdiscount.rows;
            itemTaxCde = "VAT EXEMPT";
            itemAmtDis = orderitemdiscount.rows[0].amtdis;
            itemNetVatAmt = orderitemdiscount.rows[0].salwoutvat;
            itemQty = record.itmqty;
            itemUntPrc = record.groprc;
            itemGroPrc = record.groprc;
            itemGroExt = record.groprc;
            /* For Accounting */

            if (record.taxcde === "VATABLE") {
              vatamt +=
                (record.vatamt / Number(record.numpax)) *
                (record.numpax > 1
                  ? Number(record.numpax) - Number(disc_count)
                  : 1);
              netvatamt += Number(record.netvatamt) / Number(record.numpax);

              itemVatAdj = orderitemdiscount.rows[0].lessvatadj;
              itemExtprc = itemNetVatAmt - itemAmtDis;
            } else {
              itemExtprc = itemNetVatAmt - itemAmtDis;
            }

            const item_info = {
              itemVatAdj: itemVatAdj,
              itemAmtDis: itemAmtDis,
              itemNetVatAmt: itemNetVatAmt,
              itemVatAmt: itemVatAmt,
              itemQty: itemQty,
              itemCode: record.itmcde,
              itemDesc: record["itemfile.itmdsc"],
              itemUntMea: record["itemfile.untmea"],
              itemDiscInfo: itemDiscount,
              itemExtprc: itemExtprc,
              itemTaxCde: itemTaxCde,
              itemUntPrc: itemUntPrc,
              itemBarcde: record["itemfile.barcde"],
              itemGroPrc: itemGroPrc,
              itemGroExt: itemGroExt,
              itemVatRte: itemVatRte,
            };
            iteminfo_arr.push(item_info);
          }
        }
      } else {
        /* For Accounting */
        itemDiscount = orderitemdiscount.rows;
        itemTaxCde = record.taxcde;
        itemAmtDis = orderitemdiscount.rows[0].amtdis;
        itemQty = record.itmqty;
        itemUntPrc = record.groprc;
        itemGroPrc = record.groprc;
        itemGroExt = record.groprc;
        /* For Accounting */

        if (record.taxcde === "VATABLE") {
          itemNetVatAmt =
            (record.groprc - itemAmtDis) / (1 + record.vatrte / 100);
          itemVatAmt = record.groprc - itemNetVatAmt;
          itemExtprc = record.extprc - itemAmtDis;
        } else {
          itemNetVatAmt = record.groprc - itemAmtDis;
          itemExtprc = record.extprc - itemAmtDis;
        }

        const item_info = {
          itemVatAdj: itemVatAdj,
          itemAmtDis: itemAmtDis,
          itemNetVatAmt: itemNetVatAmt,
          itemVatAmt: itemVatAmt,
          itemQty: itemQty,
          itemCode: record.itmcde,
          itemDesc: record["itemfile.itmdsc"],
          itemUntMea: record["itemfile.untmea"],
          itemDiscInfo: itemDiscount,
          itemExtprc: itemExtprc,
          itemTaxCde: itemTaxCde,
          itemUntPrc: itemUntPrc,
          itemBarcde: record["itemfile.barcde"],
          itemGroPrc: itemGroPrc,
          itemGroExt: itemGroExt,
          itemVatRte: itemVatRte,
        };
        iteminfo_arr.push(item_info);
      }
    } else {
      // WHOLE DISCOUNT
      let params;
      for (let disc of discount_res) {
        params = {
          billdocnum: record.billdocnum,
          discde: disc.discde,
          peritem: "N",
        };

        const orderdiscount = await modelList.orderdiscount.instance
          .GetInstance()
          .findAndCountAll({
            where: params,
            raw: true,
          });

        disc_count = orderdiscount.count;
        disper = disc.disper;

        if (orderdiscount.count > 0) {
          // DISCOUNT PER ITEM
          discountinfo = orderdiscount.rows;
          if (orderdiscount.rows[0].exemptvat === "Y") {
            if (record.ordertyp === "DINEIN") {
              if (record.taxcde === "VATABLE") {
                let item_numpax = record.numpax;
                let initIndex = 0;

                while (initIndex < item_numpax) {
                  itemVatAmt = 0;
                  itemVatAdj = 0;
                  itemAmtDis = 0;
                  itemNetVatAmt = 0;
                  itemQty = 0;
                  itemDiscount = [];
                  itemExtprc = 0;
                  itemTaxCde;
                  itemUntPrc = 0;
                  itemGroPrc = 0;
                  itemGroExt = 0;
                  itemVatRte = 0;

                  itemQty = Number(record.itmqty) / Number(record.numpax);
                  itemUntPrc = record.groprc;
                  itemGroPrc = record.groprc;
                  itemGroExt = record.groprc;
                  itemNetVatAmt =
                    Number(record.netvatamt) / Number(record.numpax);

                  if (initIndex === 0) {
                    // Only the first loop will get the discount
                    itemVatAdj =
                      ((record.groprc - record.netvatamt) /
                        Number(record.numpax)) *
                      Number(disc_count);
                    itemAmtDis =
                      (Number(record.netvatamt) / Number(record.numpax)) *
                      Number(disper / 100) *
                      Number(disc_count);
                    itemDiscount = orderdiscount.rows;
                    itemExtprc = itemNetVatAmt - itemAmtDis;
                    itemTaxCde = "VAT EXEMPT";
                  } else {
                    itemVatAmt =
                      (record.vatamt / Number(record.numpax)) *
                      (Number(record.numpax) - Number(disc_count));
                    itemExtprc = record.extprc / Number(record.numpax);
                    itemTaxCde = "SAL VAT";
                    itemVatRte = record.vatrte;
                  }

                  const item_info = {
                    itemVatAdj: itemVatAdj,
                    itemAmtDis: itemAmtDis,
                    itemNetVatAmt: itemNetVatAmt,
                    itemVatAmt: itemVatAmt,
                    itemQty: itemQty,
                    itemCode: record.itmcde,
                    itemDesc: record["itemfile.itmdsc"],
                    itemUntMea: record["itemfile.untmea"],
                    itemDiscInfo: itemDiscount,
                    itemExtprc: itemExtprc.toFixed(2),
                    itemTaxCde: itemTaxCde,
                    itemUntPrc: itemUntPrc,
                    itemBarcde: record["itemfile.barcde"],
                    itemGroPrc: itemGroPrc,
                    itemGroExt: itemGroExt,
                    itemVatRte: itemVatRte,
                  };
                  iteminfo_arr.push(item_info);
                  initIndex++;
                }
              } else {
                discount +=
                  (Number(record.groprc) / Number(record.numpax)) *
                  Number(disper / 100) *
                  Number(disc_count);
                netvatamt += Number(record.groprc) / Number(record.numpax);

                itemAmtDis =
                  (Number(record.extprc) / Number(record.numpax)) *
                  Number(disper / 100) *
                  Number(disc_count); // NEW VALUE

                itemNetVatAmt = record.extprc; // NEW VALUE
                itemQty = record.itmqty;
                itemDiscount = orderdiscount.rows;
                itemExtprc = itemNetVatAmt - itemAmtDis;
                itemTaxCde = "VAT EXEMPT";
                itemUntPrc = record.groprc;
                itemGroPrc = record.groprc;
                itemGroExt = record.groprc;

                const item_info = {
                  itemVatAdj: itemVatAdj,
                  itemAmtDis: itemAmtDis,
                  itemNetVatAmt: itemNetVatAmt,
                  itemVatAmt: itemVatAmt,
                  itemQty: itemQty,
                  itemCode: record.itmcde,
                  itemDesc: record["itemfile.itmdsc"],
                  itemUntMea: record["itemfile.untmea"],
                  itemDiscInfo: itemDiscount,
                  itemExtprc: itemExtprc,
                  itemTaxCde: itemTaxCde,
                  itemUntPrc: itemUntPrc,
                  itemBarcde: record["itemfile.barcde"],
                  itemGroPrc: itemGroPrc,
                  itemGroExt: itemGroExt,
                  itemVatRte: itemVatRte,
                };
                iteminfo_arr.push(item_info);
              }
            }
          }
        }
      }
    }
  } else {
    itemUntPrc = record.groprc;
    itemGroPrc = record.groprc;
    itemGroExt = record.groprc;
    itemExtprc = record.extprc;
    itemQty = record.itmqty;

    if (record.taxcde === "VATABLE") {
      itemVatAmt = record.vatamt;
      itemNetVatAmt = record.netvatamt;
      itemTaxCde = "SAL VAT";
      itemVatRte = record.vatrte;
    } else {
      itemNetVatAmt = record.extprc;
      itemTaxCde = "VAT EXEMPT";
    }

    const item_info = {
      itemVatAdj: itemVatAdj,
      itemAmtDis: itemAmtDis,
      itemNetVatAmt: itemNetVatAmt,
      itemVatAmt: itemVatAmt,
      itemQty: itemQty,
      itemCode: record.itmcde,
      itemDesc: record["itemfile.itmdsc"],
      itemUntMea: record["itemfile.untmea"],
      itemDiscInfo: itemDiscount,
      itemExtprc: itemExtprc,
      itemTaxCde: itemTaxCde,
      itemUntPrc: itemUntPrc,
      itemBarcde: record["itemfile.barcde"],
      itemGroPrc: itemGroPrc,
      itemGroExt: itemGroExt,
      itemVatRte: itemVatRte,
    };
    iteminfo_arr.push(item_info);
  }

  result = {
    discount: discount,
    vatadj: vatadj,
    x_regdiscount: x_regdiscount,
    discountinfo: discountinfo,
    vatamt: vatamt,
    netvatamt: netvatamt,
    iteminfo_arr: iteminfo_arr,
  };
  return result;
}

function getWhereLowerCase(filter, tableName) {
  if (tableName) {
    return where(
      fn('lower', col(`${tableName}.${filter.id.trim()}`)), 
      'LIKE', 
      '%' + filter.value.toLowerCase() + '%'
    )
  }
  
  return where(
    fn('lower', col(filter.id.trim())), 
    'LIKE', 
    '%' + filter.value.toLowerCase() + '%'
  )
}

const _log = (obj) => {
  console.log('\n');
  console.log('\n');
  console.log(obj);
  console.log('\n');
  console.log('\n');
}

module.exports = {
  idFormatter: idFormatter,
  dateTodayFormatter: dateTodayFormatter,
  timeTodayFormatter: timeTodayFormatter,
  dateTimeTodayFormatter: dateTimeTodayFormatter,
  dateFormatter: dateFormatter,
  LNextsCentral: LNextsCentral,
  dateSubtractionFormatter: dateSubtractionFormatter,
  NewTrnCode: NewTrnCode,
  convertToAccounting_new_v2: convertToAccounting_new_v2,
  getWhereLowerCase: getWhereLowerCase,
  _log: _log
};
