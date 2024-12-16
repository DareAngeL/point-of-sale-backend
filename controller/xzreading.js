const { Op, fn, col, literal } = require("sequelize");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();
const { Filter } = require("../model");
const { dateFormatter, dateSubtractionFormatter, _log } = require("../helper");
const { generateConsolidatorZReading } = require("../services/zreading");

module.exports = XZReadingEndPoints = () => {
  const posfile = modelList.posfile.instance;
  const userfile = modelList.pos_userfile.instance.GetInstance();
  const itemfile = modelList.item.instance.GetInstance();
  const itemclassfile = modelList.itemclassification.instance.GetInstance();
  const dinetype = modelList.dinetype.instance.GetInstance();
  const zreadingfile = modelList.zreadingfile.instance.GetInstance();
  const syspar = modelList.systemparameters.instance.GetInstance();

  const resetExtendedTime = async () => {
    try {
      const findSyspar = await syspar.findOne({});
      await findSyspar.update({ isextended: 0 });
    } catch (error) {
      console.log(error);
    }
  };

  router.get("/generate", async (req, res) => {
    console.log("GENERATING ZREADING...");

    try {
      await generateConsolidatorZReading(req);
      await generate(req, res);
      await resetExtendedTime();
    } catch (err) {
      console.error("\n" + err);
      res.status(500).send({ err: "Something wents wrong!" });
    }
  });

  const generate = async (req, res) => {
    const pos = posfile.GetInstance();

    if (req.query.cashier) {
      // check if cashier exists
      const cashier = await userfile.findOne({
        where: {
          usrcde: req.query.cashier,
        },
        raw: true,
      });

      if (!cashier) {
        res.status(404).send({ err: "Cashier does not exist!" });
        return;
      }
    }

    const headerfile = await modelList.headerfile.instance
      .GetInstance()
      .findOne({
        attributes: {
          exclude: ["recid"],
        },
        where: {
          recid: 1,
        },
        raw: true,
      });

    const { isReprint, ...otherQueries } = req.query;

    // THIS CODE IS USELESS
    // let filter;
    // if (isReprint) {
    //   filter = new Filter(otherQueries);
    // } else {
    //   filter = new Filter(req.query);
    // }

    let whereZreading;
    if (otherQueries.range) {
      whereZreading = {
        where: {
          // ...(otherQueries.cashier && {cashier: otherQueries.cashier}),
          ...(otherQueries.batchnum
            ? {
                batchnum: otherQueries.batchnum,
              }
            : {
                // zreading executes here - no batchnum query
                ...(req.query.cashier && { cashier: req.query.cashier }),
                // trndte: {
                //   [Op.between]: [otherQueries.datefrom, otherQueries.dateto],
                // },
                batchnum: "",
              }),
          trnstat: 1,
        },
        // include: {
        //   all: true,
        //   nested: true,
        // },
      };
    } else {
      whereZreading = {
        where: {
          ...otherQueries,
          trnstat: 1,
        },
        // include: {
        //   all: true,
        //   nested: true,
        // },
      };
    }

    const zreadingData = { ...whereZreading };

    let DISTINCT,
      arrPos = [];
    await pos
      .findAll({
        plain: !true,
        attributes: [[fn("DISTINCT", col("cashier")), "DISTINCT"]],
      })
      .then((result) => {
        result.map(async (e) => {
          const record = e.dataValues;
          arrPos.push({ ["DISTINCT"]: record["DISTINCT"] });
        });
      });

    arrPos
      .filter((e) => e.DISTINCT)
      .map(async (e) => {
        DISTINCT = e.DISTINCT;
      });

    let gross,
      scharge_disc,
      less_post_void,
      less_disc,
      less_serv_charge,
      cashsales,
      less_vat_adj,
      less_post_refund,
      netsales,
      xless_post_refund_netvatamt,
      xless_post_refund_vatamt,
      xless_post_refund_vatexempt,
      scpwdDisc,
      vatableSales,
      vat_amount,
      total_vat_exempt,
      total_non_vat_sales,
      vat_exempt_net,
      total_numtrans,
      total_numpax,
      total_quantity,
      discounts,
      qty,
      cashfund,
      cash_in,
      cash_out,
      exp_cash,
      declaration,
      excess,
      card_sales,
      othermop,
      sales_by_item,
      category_sales,
      sales_by_dinetype,
      postvoids,
      beg_void,
      end_void,
      postrefunds,
      beg_refund,
      end_refund,
      beg_or,
      end_or,
      z_counter,
      beg_sales;

    let cashier_param = req.query.cashier && req.query.cashier;

    const reading = zreadingData;
    const sample = {
      ...reading.where,
      // cashier: reading.cashier,
      itmcde: "SERVICE CHARGE",
      void: 0,
      refund: 0,
    };

    const localtax = Number(
      await pos.sum("extprc", {
        where: {
          ...reading.where,
          itmcde: "LOCALTAX",
          void: 0,
          refund: 0,
        },
        // include: reading.include,
      })
    );

    //#region LATEST TRNDTE
    
    console.log(zreadingData);

    const latest_trndte = await pos.findOne({
      where: zreadingData.where,
      attributes: ["trndte"],
      order: [["recid", "DESC"]],
      raw: true,
    });

    console.log(latest_trndte);

    const trndte = latest_trndte ? latest_trndte.trndte : otherQueries.dateto;

    //#endregion LATEST TRNDTE

    //#region CARD SALES
    const getCardSales = async () => {
      const rawData = await pos.findAll({
        where: {
          ...reading.where,
          postrntyp: "PAYMENT",
          itmcde: "CARD",
          void: 0,
          refund: 0,
        },
        order: [["cardclass", "ASC"]],
        group: ["cardclass", "cardtype"],
        attributes: [
          "cardclass",
          "cardtype",
          [fn("SUM", col("itmqty")), "qty"],
          [fn("SUM", col("extprc")), "amount"],
        ],
      });

      const groupedData = {};

      for (const _item of rawData) {
        const item = _item.dataValues;

        if (!groupedData[item.cardtype]) {
          groupedData[item.cardtype] = [];
        }

        groupedData[item.cardtype].push({
          amount: Number(item.amount),
          cardclass: item.cardclass,
          qty: Number(item.qty),
        });
      }

      return Object.entries(groupedData).map(([cardtype, cardList]) => ({
        cardtype,
        cardList,
      }));
    };
    //#endregion

    //#region SALES BY DINE TYPE
    const getSalesByDineType = async () => {
      const dine_type = await pos.findAll({
        where: {
          ...zreadingData.where,
          postrntyp: "ITEM",
          void: 0,
          refund: 0,
          orderitmid: {
            [Op.notIn]: literal(
              `(SELECT orderitmid FROM posfile WHERE postrntyp = 'ITEM' AND refund = 1 AND trndte BETWEEN '${dateFormatter(
                otherQueries.datefrom
              )}' AND '${dateFormatter(otherQueries.dateto)}')`
            ),
          },
        },
      });

      let grpPostypArr = [
        {
          ordertyp: "DINEIN",
          postypdata: [],
          itmqty: 0,
          extprc: 0,
        },
        {
          ordertyp: "TAKEOUT",
          postypdata: [],
          itmqty: 0,
          extprc: 0,
        },
      ];

      let dinetypeArr = await dinetype.findAll({
        raw: true,
      });

      for await (let ordertyp of dine_type) {
        const ordertypeextprc = Number(ordertyp.extprc);
        const ordertypeitmqty = Number(ordertyp.itmqty);

        const xpostypdsc = dinetypeArr.find(
          (e) => e.postypcde === ordertyp.postypcde
        );
        let postypindex = grpPostypArr.findIndex(
          (obj) => obj.ordertyp === ordertyp.ordertyp
        );

        grpPostypArr[postypindex].extprc += ordertypeextprc;
        grpPostypArr[postypindex].itmqty += ordertypeitmqty;

        let index = grpPostypArr[postypindex].postypdata.findIndex(
          (obj) => obj.postypcde === ordertyp.postypcde
        );

        if (index > -1) {
          grpPostypArr[postypindex].postypdata[index].extprc += ordertypeextprc;
          grpPostypArr[postypindex].postypdata[index].itmqty += ordertypeitmqty;
        } else {
          grpPostypArr[postypindex].postypdata.push({
            itmqty: ordertypeitmqty,
            extprc: ordertypeextprc,
            postypcde: ordertyp.postypcde,
            postypdsc: xpostypdsc ? xpostypdsc.postypdsc : ordertyp.postypcde,
          });
        }
      }

      return grpPostypArr;
    };
    //#endregion SALES BY DINE TYPE

    //#region GET TOTAL NUMBER OF PAX
    const getTotalNumpax = async () => {
      const total_first_numpax = await pos.findAll({
        attributes: [[fn("MIN", col("numpax")), "first_numpax"]],
        where: {
          ...whereZreading.where,
          trncde: "POS",
          void: 0,
          refund: 0,
        },
        group: ["billdocnum"],
        raw: true,
      });

      const sum_of_first_numpax = total_first_numpax.reduce((sum, group) => {
        return sum + group.first_numpax;
      }, 0);

      return sum_of_first_numpax;
    };
    //#endregion

    //#region sales_summ queries
    await Promise.all([
      // scharge_disc
      (scharge_disc = Number(
        await pos.sum("amtdis", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            itmcde: "SERVICE CHARGE",
            void: 0,
            refund: 0,
          },
          raw: true,
        })
      )),
      // less_post_void:
      (less_post_void = Number(
        (
          await pos.findOne({
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: {
                [Op.or]: ["TOTAL"],
              },
              void: 1,
            },
            // include: reading.include,
            attributes: [
              [
                fn(
                  "SUM",
                  col("groext")
                  // literal(
                  //   "CASE WHEN itmcde='TOTAL' THEN extprc ELSE extprc END"
                  // )
                ),
                "void",
              ],
            ],
            raw: true,
          })
        ).void
      )),
      // less_post_refund
      (less_post_refund = Number(
        (await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            itmcde: "TOTAL",
            refund: 1,
          },
          // include: reading.include,
          raw: true,
        })) -
          (await pos.sum("scharge_disc", {
            where: {
              ...reading.where,
              postrntyp: "DISCOUNT",
              refund: 1,
            },
            raw: true,
          }))
      )),
      // less_post_refund_netvatamt:
      (xless_post_refund_netvatamt = Number(
        await pos.sum("netvatamt", {
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            refund: 1,
          },
          // include: zreadingData.include,
          raw: true,
        })
      )),
      // less_post_refund_vatamt:
      (xless_post_refund_vatamt = Number(
        await pos.sum("vatamt", {
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            refund: 1,
          },
          // include: zreadingData.include,
          raw: true,
        })
      )),
      // less_post_refund_vatexempt:
      (xless_post_refund_vatexempt = Number(
        await pos.sum("vatexempt", {
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            refund: 1,
          },
          // include: zreadingData.include,
          raw: true,
        })
      )),
      // less_disc:
      (less_disc = Number(
        (
          await pos.findOne({
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              postrntyp: "DISCOUNT",
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            attributes: [[fn("SUM", literal("amtdis")), "disc"]],
            raw: true,
          })
        ).disc
      )),
      // scpwdDiscount:
      (scpwdDisc =
        Number(
          (
            await pos.findOne({
              where: {
                ...reading.where,
                // cashier: reading.cashier,
                postrntyp: "DISCOUNT",
                void: 0,
                refund: 0,
                itmcde: {
                  [Op.or]: ["Senior", "PWD"],
                },
              },
              // include: reading.include,
              attributes: [
                [
                  fn(
                    "SUM",
                    literal("CASE WHEN extprc=0 THEN amtdis ELSE extprc END")
                  ),
                  "scpwdDisc",
                ],
              ],
              raw: true,
            })
          ).scpwdDisc
          // substract refunded scpwd discount
        ) -
        Number(
          (
            await pos.findOne({
              where: {
                ...reading.where,
                postrntyp: "DISCOUNT",
                refund: 1,
                itmcde: {
                  [Op.or]: ["Senior", "PWD"],
                },
              },
              attributes: [
                [
                  fn(
                    "SUM",
                    literal("CASE WHEN extprc=0 THEN amtdis ELSE extprc END")
                  ),
                  "scpwdDisc",
                ],
              ],
              raw: true,
            })
          ).scpwdDisc
        )),
      // less_vat_adj:
      (less_vat_adj = Number(
        await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            itmcde: "Less VAT Adj.",
            void: 0,
            refund: 0,
          },
          // include: reading.include,
          raw: true,
        })
      )),
      // total_non_vat_sales:
      (total_non_vat_sales = Number(
        await pos.sum("netvatamt", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            taxcde: "VAT 0 RATED",
            void: 0,
            refund: 0,
          },
          // include: reading.include,
          raw: true,
        })
      )),
      // total_numtrans:
      // Number(
      (total_numtrans = (
        await pos.count({
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            trncde: "POS",
          },
          // include: reading.include,
          group: ["ordocnum"],
        })
      ).length),
      // ),
      // total_numpax:
      (total_numpax = await getTotalNumpax()),
      // total_quantity:
      (total_quantity = Number(
        await pos.sum("itmqty", {
          where: {
            ...zreadingData.where,
            trncde: "POS",
            postrntyp: "ITEM",
            void: 0,
            refund: 0,
          },
          raw: true,
        })
      )),
      // discounts:
      (discounts = (
        await pos.findAll({
          where: {
            ...zreadingData.where,
            postrntyp: "DISCOUNT",
            trncde: "POS",
            void: 0,
            refund: 0,
          },
          group: [col("posfile.itmcde")],
          attributes: [
            "discde",
            [
              fn(
                "COUNT",
                fn("DISTINCT", literal("CONCAT(itmcde, '-', ordocnum)"))
              ),
              "qty",
            ],
            [
              fn(
                "SUM",
                literal("CASE WHEN extprc = 0 THEN extprc ELSE amtdis END")
              ),
              "amtdis",
            ],
          ],
          raw: true,
        })
      ).map((d) => {
        return {
          ...d,
          amtdis: Number(d.amtdis),
        };
      })),
    ]);

    await Promise.all([
      // gross_sales:
      (gross =
        Number(
          (
            await pos.findOne({
              where: {
                ...reading.where,
                // cashier: reading.cashier,
                itmcde: {
                  [Op.or]: ["TOTAL", "SERVICE CHARGE"],
                },
                refund: 0,
              },
              // include: reading.include,
              attributes: [
                [
                  fn(
                    "SUM",
                    literal(
                      "CASE WHEN itmcde='TOTAL' THEN groext ELSE extprc END"
                    )
                  ),
                  "gross",
                ],
              ],
              raw: true,
            })
          ).gross
        ) - scharge_disc),
      // less_serv_charge:
      (less_serv_charge =
        Number(
          await pos.sum("extprc", {
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: "SERVICE CHARGE",
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            raw: true,
          })
        ) - scharge_disc),
      // vat_amount:
      (vat_amount =
        Number(
          await pos.sum("vatamt", {
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: "TOTAL",
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            raw: true,
          })
        ) - xless_post_refund_vatamt),
      // total_vat_sales:
      (vatableSales =
        Number(
          await pos.sum("netvatamt", {
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: "TOTAL",
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            raw: true,
          })
        ) - xless_post_refund_netvatamt),
      // total_vat_exempt:
      (total_vat_exempt =
        Number(
          await pos.sum("extprc", {
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: "DISCOUNTABLE",
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            raw: true,
          })
        ) - xless_post_refund_vatexempt),
      // CASH - QTY
      (qty = await pos.count({
        where: {
          ...reading.where,
          // cashier: reading.cashier,
          itmcde: "CASH",
          void: 0,
          refund: 0,
        },
        // include: reading.include,
        raw: true,
      })),
      // cashsales:
      (cashsales =
        Number(
          await pos.sum("extprc", {
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: "CASH",
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            raw: true,
          })
        ) -
        Number(
          await pos.sum("extprc", {
            where: {
              ...reading.where,
              // cashier: reading.cashier,
              itmcde: {
                [Op.or]: ["CHANGE", "EXCESS"],
              },
              void: 0,
              refund: 0,
            },
            // include: reading.include,
            raw: true,
          })
        ) -
        less_post_refund),
      // cashfund:
      (cashfund = Number(
        await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            postrntyp: "CASHFUND",
          },
          // include: reading.include,
          raw: true,
        })
      )),
      // cash_in:
      (cash_in = Number(
        await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            postrntyp: "CASHIN",
          },
          // include: reading.include,
          raw: true,
        })
      )),
      // cash_out:
      (cash_out = Number(
        await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            postrntyp: "CASHOUT",
          },
          // include: reading.include,
          raw: true,
        })
      )),
    ]);

    await Promise.all([
      // net_sales:
      (netsales = Number(
        (
          gross -
          less_disc -
          // less_serv_charge -
          less_vat_adj -
          less_post_void -
          less_post_refund
        ).toFixed(2)
      )),
      // Number(Number(await pos.sum("extprc", {
      //   where: {
      //     ...reading.where,
      //     postrntyp: {
      //       [Op.or]: ["Less VAT Adj.", "DISCOUNT"],
      //     },
      //     refund: 1,
      //   }
      // })).toFixed(2))
      // vat_exempt_net:
      (vat_exempt_net =
        headerfile.chknonvat === 0
          ? Number(
              await pos.sum("extprc", {
                where: {
                  ...reading.where,
                  // cashier: reading.cashier,
                  itmcde: "DISCOUNTABLE",
                  void: 0,
                  refund: 0,
                },
                raw: true,
              })
            ) -
            scpwdDisc +
            vatableSales -
            xless_post_refund_vatexempt
          : Number(
              await pos.sum("extprc", {
                where: {
                  ...reading.where,
                  // cashier: reading.cashier,
                  itmcde: "DISCOUNTABLE",
                  void: 0,
                  refund: 0,
                },
                raw: true,
              })
            ) -
            less_disc +
            vatableSales -
            xless_post_refund_vatexempt),
      // end_cash:
      (declaration = Number(
        await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            postrntyp: "DECLARATION",
          },
          // include: reading.include,
          raw: true,
        })
      )),
      // excess:
      (excess = Number(
        await pos.sum("extprc", {
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            postrntyp: "EXCESS",
            itmcde: "EXCESS",
            void: 0,
            refund: 0,
          },
          // include: reading.include,
          raw: true,
        })
      )),
      // card_sales:
      (card_sales = await getCardSales()),
      // othermop:
      (othermop = (
        await pos.findAll({
          where: {
            ...zreadingData.where,
            postrntyp: "PAYMENT",
            itmcde: {
              [Op.notIn]: ["CARD", "CASH"],
            },
            void: 0,
            refund: 0,
          },
          // include: zreadingData.include,
          order: [["itmcde", "ASC"]],
          group: [col("posfile.itmcde")],
          attributes: [
            [col("posfile.itmcde"), "paymenttype"],
            [fn("SUM", col("itmqty")), "qty"],
            [fn("SUM", col("extprc")), "amount"],
            [
              literal(
                `${Number(
                  await pos.sum("extprc", {
                    ...zreadingData,
                    where: {
                      postrntyp: "EXCESS",
                      itmcde: "EXCESS",
                    },
                  })
                )}`
              ),
              "excess",
            ],
          ],
          raw: true,
        })
      ).map((d) => {
        return {
          paymenttype: d.paymenttype,
          qty: Number(d.qty),
          amount: Number(d.amount),
          excess: d.excess,
        };
      })),
      // sales_by_item:
      (sales_by_item = (
        await pos.findAll({
          where: {
            ...zreadingData.where,
            postrntyp: "ITEM",
            void: 0,
            refund: 0,
            orderitmid: {
              [Op.notIn]: literal(
                `(SELECT orderitmid FROM posfile WHERE postrntyp = 'ITEM' AND refund = 1 AND trndte BETWEEN '${dateFormatter(
                  otherQueries.datefrom
                )}' AND '${dateFormatter(otherQueries.dateto)}')`
              ),
            },
          },
          order: [["itmcde", "ASC"]],
          group: [col("posfile.itmcde")],
          attributes: [
            col("posfile.itmcde"),
            [fn("SUM", col("itmqty")), "itmqty"],
            [fn("SUM", col("extprc")), "extprc"],
            [
              literal(
                `(SELECT CASE WHEN itmdsc IS NOT NULL THEN itmdsc ELSE itmcde END FROM itemfile WHERE itmcde = posfile.itmcde)`
              ),
              "itmdsc",
            ],
          ],
          raw: true,
        })
      ).map((d) => {
        return {
          ...d,
          itmqty: Number(d.itmqty),
          extprc: Number(d.extprc),
        };
      })),
      // category_sales:
      (category_sales = (
        await pos.findAll({
          where: {
            ...zreadingData.where,
            void: 0,
            refund: 0,
            postrntyp: "ITEM",
            orderitmid: {
              [Op.notIn]: literal(
                `(SELECT orderitmid FROM posfile WHERE postrntyp = 'ITEM' AND refund = 1 AND trndte BETWEEN '${dateFormatter(
                  otherQueries.datefrom
                )}' AND '${dateFormatter(otherQueries.dateto)}')`
              ),
            },
          },
          include: [
            {
              model: itemfile,
              attributes: [],
              include: [
                {
                  model: itemclassfile,
                  attributes: [],
                },
              ],
            },
          ],
          attributes: [
            [col("itemfile.itemclassfile.itmcladsc"), "itmcladsc"],
            [fn("SUM", col("posfile.itmqty")), "itmqty"],
            [fn("SUM", col("posfile.extprc")), "extprc"],
          ],
          group: [col("itemfile.itemclassfile.itmcladsc")],
          raw: true,
        })
      ).map((d) => {
        return {
          ...d,
          itmqty: Number(d.itmqty),
          extprc: Number(d.extprc),
        };
      })),
      // sales_by_dinetype:
      (sales_by_dinetype = await getSalesByDineType()),
      // postvoids:
      (postvoids = (
        await pos.findAll({
          where: {
            ...zreadingData.where,
            postrntyp: "TOTAL",
            void: 1,
          },
          // include: zreadingData.include,
          attributes: [
            ["voidnum", "voidref"],
            ["ordocnum", "or"],
          ],
          raw: true,
        })
      ).map((d) => {
        return {
          voidref: d.voidref,
          or: d.or,
        };
      })),
      // beg_void:
      (beg_void =
        (await pos.count({
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            void: 1,
          },
          // include: zreadingData.include,
          order: [["recid", "ASC"]],
          attributes: ["voidnum"],
          raw: true,
        })) > 0
          ? await pos.findOne({
              where: {
                ...zreadingData.where,
                itmcde: "TOTAL",
                void: 1,
              },
              order: [["recid", "ASC"]],
              attributes: ["voidnum"],
              raw: true,
            })
          : ""),
      // end_void:
      (end_void =
        (await pos.count({
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            void: 1,
          },
          // include: zreadingData.include,
          order: [["recid", "DESC"]],
          attributes: ["voidnum"],
          raw: true,
        })) > 0
          ? await pos.findOne({
              where: {
                ...zreadingData.where,
                itmcde: "TOTAL",
                void: 1,
              },
              order: [["recid", "DESC"]],
              attributes: ["voidnum"],
              raw: true,
            })
          : ""),
      // postrefunds:
      (postrefunds = await Promise.all(
        (
          await pos.findAll({
            where: {
              ...zreadingData.where,
              postrntyp: "TOTAL",
              refund: 1,
            },
            // include: zreadingData.include,
            attributes: ["refnum", ["extprc", "or"]],
            raw: true,
          })
        ).map(async (d) => {
          return {
            refnum: d.refnum,
            or:
              Number(d.or) -
              Number(
                await pos.sum("scharge_disc", {
                  where: {
                    ...reading.where,
                    postrntyp: "DISCOUNT",
                    refnum: d.refnum,
                    refund: 1,
                  },
                  raw: true,
                })
              ),
          };
        })
      )),
      // beg_refund:
      (beg_refund =
        (await pos.count({
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            refund: 1,
          },
          // include: zreadingData.include,
          raw: true,
        })) > 0
          ? await pos.findOne({
              where: {
                ...zreadingData.where,
                itmcde: "TOTAL",
                refund: 1,
              },
              attributes: ["refnum"],
              order: [["recid", "ASC"]],
              raw: true,
            })
          : ""),
      // end_refund:
      (end_refund =
        (await pos.count({
          where: {
            ...zreadingData.where,
            itmcde: "TOTAL",
            refund: 1,
          },
          // include: zreadingData.include,
          raw: true,
        })) > 0
          ? await pos.findOne({
              where: {
                ...zreadingData.where,
                itmcde: "TOTAL",
                refund: 1,
              },
              attributes: ["refnum"],
              order: [["recid", "DESC"]],
              raw: true,
            })
          : ""),
      // beg_or:
      (beg_or =
        (await pos.count({
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            trncde: "POS",
          },
          // include: reading.include,
          order: ["ordocnum"],
          attributes: ["ordocnum"],
          raw: true,
        })) > 0
          ? (
              await pos.findOne({
                where: {
                  ...reading.where,
                  // cashier: reading.cashier,
                  trncde: "POS",
                  ordocnum: { [Op.ne]: null },
                },
                // include: reading.include,
                order: [["ordocnum", "ASC"]],
                attributes: ["ordocnum"],
                raw: true,
              })
            ).ordocnum
          : ""),
      // end_or:
      (end_or =
        (await pos.count({
          where: {
            ...reading.where,
            // cashier: reading.cashier,
            trncde: "POS",
          },
          // include: reading.include,
          order: ["ordocnum"],
          attributes: ["ordocnum"],
          raw: true,
        })) > 0
          ? (
              await pos.findOne({
                where: {
                  ...reading.where,
                  // cashier: reading.cashier,
                  trncde: "POS",
                },
                // include: reading.include,
                order: [["ordocnum", "DESC"]],
                attributes: ["ordocnum"],
                raw: true,
              })
            ).ordocnum
          : ""),
      // z_counter:
      (z_counter =
        (await pos.count({
          where: {
            postrntyp: "GRANDTOTAL",
            trnstat: 1,
            trndte: {
              [Op.lt]: dateFormatter(trndte),
            },
          },
          raw: true,
        })) + 1),
      // beg_sales:
      (beg_sales =
        (await pos.count({
          where: {
            postrntyp: "GRANDTOTAL",
            trnstat: 1,
            trndte: {
              [Op.lt]: dateFormatter(trndte),
            },
          },
          raw: true,
        })) > 0
          ? Number(
              (
                await pos.findOne({
                  where: {
                    postrntyp: "GRANDTOTAL",
                    trnstat: 1,
                    trndte: {
                      [Op.lt]: dateFormatter(trndte),
                    },
                  },
                  attributes: ["extprc"],
                  order: [["recid", "DESC"]],
                  raw: true,
                })
              ).extprc
            )
          : 0),
    ]);
    //#endregion

    const sales_by_cashier = [
      {
        cashier: cashier_param,
        sales_summ: {
          localtax: localtax,
          serv_charge_disc: scharge_disc,
          gross_sales: gross,
          less_post_void: less_post_void,
          less_post_refund: less_post_refund,
          less_post_refund_netvatamt: xless_post_refund_netvatamt,
          less_post_refund_vatamt: xless_post_refund_vatamt,
          less_post_refund_vatexempt: xless_post_refund_vatexempt,
          less_disc: less_disc,
          scpwdDiscount: scpwdDisc,
          less_serv_charge: less_serv_charge,
          less_vat_adj: less_vat_adj,
          vat_amount: vat_amount,
          net_sales: netsales,
          total_vat_sales: vatableSales,
          total_vat_exempt: total_vat_exempt,
          vat_exempt_net: vat_exempt_net,
          total_non_vat_sales: total_non_vat_sales,
          total_numtrans: total_numtrans,
          total_numpax: total_numpax,
          total_quantity: total_quantity,
        },
        discounts: discounts,
        cash_tran_summ: {
          cash: {
            qty: qty,
            cashsales: cashsales,
          },
          cashfund: cashfund,
          cash_in: cash_in,
          cash_out: cash_out,
          exp_cash: (exp_cash = cashsales + (cashfund + cash_in - cash_out)),
          pos_cash: exp_cash,
          end_cash: declaration,
          shortover: declaration - exp_cash,
          excess: excess,
        },
        card_sales: card_sales,
        othermop: othermop,
        sales_by_item: sales_by_item,
        category_sales: category_sales,
        sales_by_dinetype: sales_by_dinetype,
        postvoids: postvoids,
        beg_void: beg_void,
        end_void: end_void,
        postrefunds: postrefunds,
        beg_refund: beg_refund,
        end_refund: end_refund,
        docnum_summ: {
          beg_or: beg_or,
          end_or: end_or,
        },
        z_counter: z_counter,
        beg_sales: beg_sales,
        end_sales: netsales + beg_sales ? netsales + beg_sales : 0,
      },
    ];

    //#region AVERAGE SALES CALCULATION
    let begOr = Number(
      sales_by_cashier[0].docnum_summ.beg_or
        ? sales_by_cashier[0].docnum_summ.beg_or.substring(4)
        : "-1"
    );
    const endOr = Number(
      sales_by_cashier[0].docnum_summ.end_or
        ? sales_by_cashier[0].docnum_summ.end_or.substring(4)
        : "-1"
    );
    begOr = !begOr ? endOr : begOr; // if begOr is null, force use the endOr value
    const totalTrans = begOr === -1 && endOr === -1 ? 0 : endOr - begOr + 1;
    const averageSales = totalTrans === 0 ? 0 : gross / totalTrans;
    sales_by_cashier[0].sales_summ["average_sales"] = averageSales;
    // sales_by_cashier[0].sales_summ["total_numtrans"] = totalTrans;
    //#endregion AVERAGE SALES CALCULATION

    //#region for zreadfile table -> used for recompute zreading module in front-end
    if (!req.query.isReprint) {
      const sales_summary = sales_by_cashier[0].sales_summ;
      const cash_tran_summ = sales_by_cashier[0].cash_tran_summ;

      const xzread_trndte =
        (await await pos.count({
          where: {
            ...zreadingData.where,
            trncde: "POS",
          },
          // include: zreadingData.include,
          order: [["recid", "ASC"]],
          attributes: ["trndte"],
          raw: true,
        })) > 0
          ? (
              await pos.findOne({
                where: {
                  ...zreadingData.where,
                  trncde: "POS",
                },
                // include: zreadingData.include,
                order: [["recid", "ASC"]],
                attributes: ["trndte"],
                raw: true,
              })
            ).trndte
          : "";

      const xprevZread = await zreadingfile.findAll({
        where: {
          trndte: dateSubtractionFormatter(xzread_trndte, 1),
        },
        raw: true,
      });

      const xtodayZread = await zreadingfile.findAll({
        where: {
          trndte: xzread_trndte,
        },
        raw: true,
      });

      const lessRegdisc = await pos.sum("extprc", {
        where: {
          ...zreadingData.where,
          postrntyp: "DISCOUNT",
          void: 0,
          refund: 0,
          govdisc: 0,
        },
        // include: zreadingData.include,
        attributes: [
          [
            literal("CASE WHEN extprc = 0 THEN amtdis ELSE extprc END"),
            "discount",
          ],
        ],
        raw: true,
      });

      const lessGov = await pos.sum("extprc", {
        where: {
          ...zreadingData.where,
          postrntyp: "DISCOUNT",
          void: 0,
          refund: 0,
          itmcde: {
            [Op.notIn]: ["Senior", "PWD"],
          },
          govdisc: 1,
        },
        // include: zreadingData.include,
        attributes: [
          [
            fn(
              "SUM",
              literal("CASE WHEN extprc = 0 THEN amtdis ELSE extprc END")
            ),
            "discount",
          ],
        ],
        raw: true,
      });

      const xothermop = await pos.sum("extprc", {
        where: {
          ...zreadingData.where,
          postrntyp: "PAYMENT",
          itmcde: {
            [Op.notIn]: ["CARD", "CHECK", "CASH"],
          },
          void: 0,
          refund: 0,
        },
        // include: zreadingData.include,
        raw: true,
      });

      const xcardsal = await pos.sum("extprc", {
        where: {
          ...zreadingData.where,
          postrntyp: "PAYMENT",
          itmcde: "CARD",
          void: 0,
          refund: 0,
        },
        // include: zreadingData.include,
        raw: true,
      });

      const xdebit_sal = await pos.sum("extprc", {
        where: {
          ...zreadingData.where,
          postrntyp: "PAYMENT",
          itmcde: {
            [Op.not]: "CARD",
          },
          cardclass: {
            [Op.not]: "CREDIT CARD",
          },
          void: 0,
          refund: 0,
        },
        // include: zreadingData.include,
        raw: true,
      });

      const xcredit_sal = await pos.sum("extprc", {
        where: {
          ...zreadingData.where,
          postrntyp: "PAYMENT",
          itmcde: {
            [Op.not]: "CARD",
          },
          cardclass: "CREDIT CARD",
          void: 0,
          refund: 0,
        },
        // include: zreadingData.include,
        raw: true,
      });

      let forZreadfile = [
        {
          trndte: xzread_trndte,
          grosssal:
            Number(sales_summary.gross_sales) + Number(sales_summary.localtax),
          lesspostvoid: sales_summary.less_post_void,
          lesspostrefund: sales_summary.less_post_refund,
          lessdicount: sales_summary.less_disc,
          lesscharge: sales_summary.less_serv_charge,
          lessvat: sales_summary.less_vat_adj,
          netsalwvat: sales_summary.net_sales,
          netsalwovat: sales_summary.vat_exempt_net,
          totvatsal: sales_summary.total_vat_sales,
          vatamt: sales_summary.vat_amount,
          localtax: sales_summary.localtax,
          totvatexempt: sales_summary.total_vat_exempt,
          tottran: sales_summary.total_numtrans,
          totqty: sales_summary.total_quantity,
          govdisc: lessRegdisc,
          regdisc: lessGov,
          scpwddisc: sales_summary.scpwdDiscount,
          cashsal: cash_tran_summ.cash.cashsales,
          cashno: cash_tran_summ.cash.qty,
          cashin: cash_tran_summ.cash_in,
          cashout: cash_tran_summ.cash_out,
          cashfund: cash_tran_summ.cashfund,
          cashdrawer: cash_tran_summ.exp_cash,
          declaration: cash_tran_summ.end_cash,
          pos_cash: cash_tran_summ.pos_cash,
          shortover: cash_tran_summ.shortover,
          excess: cash_tran_summ.excess,
          othermop: xothermop,
          totpax: sales_summary.total_numpax,
          cardsal: xcardsal,
          debitsal: xdebit_sal,
          creditsal: xcredit_sal,
          begor: sales_by_cashier[0].docnum_summ.beg_or,
          endor: sales_by_cashier[0].docnum_summ.end_or,
          zcounter: sales_by_cashier[0].z_counter,
          begsal: sales_by_cashier[0].beg_sales,
          endsal: sales_by_cashier[0].end_sales,
          prevtottran:
            xprevZread.length > 0
              ? Number(xprevZread[0].tottran) + sales_summary.total_numtrans
              : Number(sales_summary.total_numtrans),
        },
      ];
      // create or updates the zreadfile table
      if (xtodayZread.length === 0) {
        await zreadingfile.create(forZreadfile[0]);
      } else {
        await zreadingfile.update(forZreadfile[0], {
          where: {
            trndte: xtodayZread[0].recid,
          },
        });
      }
    }
    //#endregion

    res.send([
      {
        ...sales_by_cashier[0],
      },
    ]);
  };

  return router;
};
