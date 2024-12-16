const { Op, fn, col, literal } = require("sequelize");
const { modelList } = require("../model/model");
const express = require("express");
const { _log } = require("../helper");
const router = express.Router();

module.exports = readingEndPoints = () => {
  const posfile = modelList.posfile.instance;

  router.get("/", async (req, res) => {
    const pos = posfile.GetInstance();

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

    const syspar = await modelList.systemparameters.instance
      .GetInstance()
      .findOne({
        attributes: [
          "timestart",
          "sm",
          "megaworld",
          "ayala",
          "robinson",
          "vatrte",
          "ortigas",
          "naia",
        ],
        where: {
          recid: 1,
        },
        raw: true,
      });

    let zreadingData;

    zreadingData = await pos.findAll({
      where: {
        trndte: {
          [Op.between]: [req.query.dtefrom, req.query.dteto],
        },
        trnstat: 1,
      },
      attributes: ["trndte", "batchnum", "logtim"],
      raw: true,
    });

    // let uniqueDte = zreadingData
    //   .map((dte) => dte.trndte)
    //   .filter((value, index, self) => self.indexOf(value) === index);

    let uniqueBatch = zreadingData
      .map((btch) => btch.batchnum)
      .filter((value, index, self) => self.indexOf(value) === index);

    let dateRangeResult = {};
    let arrDateRangeResult = [];

    try {
      for (let index = 0; index < uniqueBatch.length; index++) {
        // global.socket.emit(
        //   "managersreport_call",
        //   `Retrieving Data <b>${uniqueDte[index]}</b>`
        // );
        let batchno = uniqueBatch[index];
        let date =
          (await pos.count({
            where: {
              trndte: {
                [Op.between]: [req.query.dtefrom, req.query.dteto],
              },
              trnstat: 1,
            },
            batchnum: batchno,
            order: [["recid", "DESC"]],
            attributes: ["trndte"],
            raw: true,
          })) > 0
            ? (
                await pos.findOne({
                  where: {
                    trndte: {
                      [Op.between]: [req.query.dtefrom, req.query.dteto],
                    },
                    trnstat: 1,
                  },
                  batchnum: batchno,
                  order: [["recid", "DESC"]],
                  attributes: ["trndte"],
                  raw: true,
                })
              ).trndte
            : "";
  
        if (index == 0) {
          const posfile = await pos.findOne({
            where: {
              trndte: {
                [Op.between]: [req.query.dtefrom, req.query.dteto],
              },
              trnstat: 1,
            },
            batchnum: batchno,
            postrntyp: {
              [Op.ne]: "GRANDTOTAL",
            },
            order: [["recid", "DESC"]],
            attributes: ["batchnum", "logtim", "trndte"],
            raw: true,
          });
  
          if (posfile.logtim < syspar.timestart) {
            continue;
          }
        }
  
        // SALES SUMMARY FOR Z READING
        const scharge_disc = Number(
          await pos.sum("amtdis", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              itmcde: "SERVICE CHARGE",
              void: 0,
              refund: 0,
            },
            raw: true,
          })
        );
  
        const gross =
          Number(
            (
              await pos.findOne({
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  itmcde: {
                    [Op.or]: ["TOTAL", "SERVICE CHARGE"],
                  },
                  void: 0,
                  refund: 0,
                },
                attributes: [
                  [
                    fn(
                      "sum",
                      literal(
                        "CASE WHEN itmcde='TOTAL' THEN groext ELSE extprc END"
                      )
                    ),
                    "grossSales",
                  ],
                ],
                raw: true,
              })
            ).grossSales
          ) - scharge_disc;
  
        const post_void = Number(
          (
            await pos.findOne({
              where: {
                batchnum: batchno,
                trnstat: 1,
                itmcde: {
                  [Op.or]: ["TOTAL", "SERVICE CHARGE"],
                },
                void: 1,
              },
              attributes: [
                [
                  fn(
                    "sum",
                    literal(
                      "CASE WHEN itmcde='TOTAL' THEN groext ELSE extprc END"
                    )
                  ),
                  "void",
                ],
              ],
              raw: true,
            })
          ).void
        );
  
        const post_refund = Number(
          await pos.sum("extprc", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              itmcde: "TOTAL",
              refund: 1,
            },
            raw: true,
          })
        );
  
        const post_refund_netvatamt = Number(
          await pos.sum("netvatamt", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              itmcde: "TOTAL",
              refund: 1,
            },
            raw: true,
          })
        );
  
        const post_refund_vatamt = Number(
          await pos.sum("vatamt", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              itmcde: "TOTAL",
              refund: 1,
            },
            raw: true,
          })
        );
  
        const post_refund_vatexempt = Number(
          await pos.sum("vatexempt", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              itmcde: "TOTAL",
              refund: 1,
            },
            raw: true,
          })
        );
  
        const disc = Number(
          (
            await pos.findOne({
              where: {
                batchnum: batchno,
                trnstat: 1,
                postrntyp: "DISCOUNT",
                void: 0,
                refund: 0,
              },
              attributes: [
                [
                  fn(
                    "sum",
                    literal("CASE WHEN extprc=0 THEN amtdis ELSE extprc END")
                  ),
                  "discount",
                ],
              ],
              raw: true,
            })
          ).discount
        );
  
        const scpwdDisc = Number(
          (
            await pos.findOne({
              where: {
                batchnum: batchno,
                trnstat: 1,
                postrntyp: "DISCOUNT",
                itmcde: {
                  [Op.or]: ["Senior", "PWD"],
                },
                void: 0,
                refund: 0,
              },
              attributes: [
                [
                  fn(
                    "sum",
                    literal("CASE WHEN extprc=0 THEN amtdis ELSE extprc END")
                  ),
                  "scpwdDisc",
                ],
              ],
              raw: true,
            })
          ).scpwdDisc
        );
  
        const serv_charge =
          Number(
            await pos.sum("extprc", {
              where: {
                batchnum: batchno,
                trnstat: 1,
                itmcde: "SERVICE CHARGE",
                void: 0,
                refund: 0,
              },
              raw: true,
            })
          ) - scharge_disc;
  
        const vat_adj = Number(
          await pos.sum("extprc", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              itmcde: "Less VAT Adj.",
              void: 0,
              refund: 0,
            },
            attributes: [[fn("sum", col("extprc")), "extprc"]],
            raw: true,
          })
        );
  
        const vatamt =
          Number(
            await pos.sum("vatamt", {
              where: {
                batchnum: batchno,
                trnstat: 1,
                itmcde: "TOTAL",
                void: 0,
                refund: 0,
              },
              raw: true,
            })
          ) - post_refund_vatamt;
  
        let xnet_sales =
          gross - post_void - post_refund - disc - serv_charge - vat_adj;
  
        const vatableSales =
          Number(
            await pos.sum("netvatamt", {
              where: {
                batchnum: batchno,
                trnstat: 1,
                itmcde: "TOTAL",
                void: 0,
                refund: 0,
              },
              raw: true,
          })) - post_refund_netvatamt;
  
        const xrecid =
          (await pos.findOne({
            where: {
              postrntyp: {
                [Op.eq]: "GRANDTOTAL",
              },
              trnstat: 1,
              batchnum: batchno,
            },
            attributes: ["recid"],
            raw: true,
          })).recid;
  
        const oldgt =
          (await pos.count({
            where: {
              postrntyp: {
                [Op.eq]: "GRANDTOTAL",
              },
              trnstat: 1,
              batchnum: {
                [Op.ne]: batchno,
              },
              recid: {
                [Op.lt]: xrecid,
              },
            },
            raw: true,
          })) > 0
            ? Number(
                (
                  await pos.findOne({
                    where: {
                      postrntyp: {
                        [Op.eq]: "GRANDTOTAL",
                      },
                      trnstat: 1,
                      batchnum: {
                        [Op.ne]: batchno,
                      },
                      recid: {
                        [Op.lt]: xrecid,
                      },
                    },
                    order: [["recid", "DESC"]],
                    attributes: ["extprc"],
                    raw: true,
                  })
                ).extprc
              )
            : 0;
  
        const cashfund = Number(
          await pos.sum("extprc", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              postrntyp: "CASHFUND",
            },
            raw: true,
          })
        );
  
        const cash_in = Number(
          await pos.sum("extprc", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              postrntyp: "CASHIN",
            },
            raw: true,
          })
        );
  
        const cash_out = Number(
          await pos.sum("extprc", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              postrntyp: "CASHOUT",
            },
            raw: true,
          })
        );
  
        const cashsales =
          Number(
            await pos.sum("extprc", {
              where: {
                batchnum: batchno,
                trnstat: 1,
                itmcde: "CASH",
                void: 0,
                refund: 0,
              },
              raw: true,
            })
          ) -
          Number(
            await pos.sum("extprc", {
              where: {
                batchnum: batchno,
                trnstat: 1,
                itmcde: {
                  [Op.or]: ["CHANGE", "EXCESS"],
                },
                void: 0,
                refund: 0,
              },
              raw: true,
            })
          ) -
          post_refund;
  
        let exp_cash = cashsales + (cashfund + cash_in - cash_out);
  
        const declaration = Number(
          await pos.sum("extprc", {
            where: {
              batchnum: batchno,
              trnstat: 1,
              postrntyp: "DECLARATION",
            },
            raw: true,
          })
        );
  
        const getTotalNumpax = async () => {
          const total_first_numpax = await pos.findAll({
            attributes: [
              [fn('MIN', col('numpax')), 'first_numpax']
            ],
            where: {
              batchnum: batchno,
              trnstat: 1,
              trncde: "POS",
              void: 0,
              refund: 0,
            },
            group: ['billdocnum'],
            raw: true
          });
  
          _log(total_first_numpax);
    
          const sum_of_first_numpax = total_first_numpax.reduce((sum, group) => {
            return sum + group.first_numpax;
          }, 0);
    
          return sum_of_first_numpax;
        }
  
        arrDateRangeResult.push({
          date: date,
          sales_summary: {
            serv_charge_disc: scharge_disc,
            gross_sales: gross,
            less_post_void: post_void,
            less_post_refund: post_refund,
            less_disc: disc,
            scpwdDiscount: scpwdDisc,
            less_serv_charge: serv_charge,
            less_vat_adj: vat_adj,
            vat_amount: vatamt,
            net_sales: !headerfile.chknonvat ? xnet_sales : 0,
            total_vat_sales: vatableSales,
            total_vat_exempt:
              Number(
                await pos.sum("extprc", {
                  where: {
                    batchnum: batchno,
                    trnstat: 1,
                    itmcde: "DISCOUNTABLE",
                    void: 0,
                    refund: 0,
                  },
                  raw: true,
                })
              ) - post_refund_vatexempt,
            vat_exempt_net: !headerfile.chknonvat
              ? Number(
                  await pos.sum("extprc", {
                    where: {
                      batchnum: batchno,
                      trnstat: 1,
                      itmcde: "DISCOUNTABLE",
                      void: 0,
                      refund: 0,
                    },
                    raw: true,
                  })
                ) -
                scpwdDisc +
                vatableSales -
                post_refund_vatexempt
              : Number(
                  await pos.sum("extprc", {
                    where: {
                      batchnum: batchno,
                      trnstat: 1,
                      itmcde: "DISCOUNTABLE",
                      void: 0,
                      refund: 0,
                    },
                    raw: true,
                  })
                ) -
                disc +
                vatableSales -
                post_refund_vatexempt,
            total_non_vat_sales: Number(
              await pos.sum("netvatamt", {
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  taxcde: "VAT 0 RATED",
                  void: 0,
                  refund: 0,
                },
                raw: true,
              })
            ),
            total_numtrans: Number(
              (await pos.count({
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  trncde: "POS",
                },
                group: ["ordocnum"],
                raw: true,
              })).length
            ),
            total_numpax: await getTotalNumpax(),
            // total_numpax: Number(
            //   (await pos.findOne({
            //     where: {
            //       batchnum: batchno,
            //       trnstat: 1,
            //       trncde: "POS",
            //       void: 0,
            //       refund: 0,
            //     },
            //     attributes: [
            //       [fn("DISTINCT", col("billdocnum")), "billdocnum"], // Get distinct billdocnum
            //       [fn("SUM", col("numpax")), "totalNumpax"], // Sum numpax
            //     ],
            //     raw: true,
            //   })).totalNumpax
            // ),
            total_quantity: Number(
              await pos.sum("itmqty", {
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  trncde: "POS",
                  postrntyp: "ITEM",
                  void: 0,
                  refund: 0,
                },
                raw: true,
              })
            ),
            gt: {
              z_counter:
                Number(
                  await pos.count({
                    where: {
                      trndte: {
                        [Op.between]: [req.query.dtefrom, req.query.dteto],
                      },
                      trnstat: 1,
                      postrntyp: "GRANDTOTAL",
                      trndte: {
                        [Op.lt]: date,
                      },
                    },
                    raw: true,
                  })
                ) + 1,
              old_gt: oldgt,
              gt: xnet_sales + oldgt ? xnet_sales + oldgt : 0,
              gt2:
                xnet_sales + (oldgt ? oldgt : 0)
                  ? xnet_sales + (oldgt ? oldgt : 0)
                  : 0,
            },
          },
          discounts: await pos.findAll({
            where: {
              batchnum: batchno,
              trnstat: 1,
              postrntyp: "DISCOUNT",
              trncde: "POS",
              void: 0,
              refund: 0,
            },
            group: [col("posfile.itmcde")],
            attributes: [
              ["itmcde", "posfile.itmcde"],
              "discde",
              [fn("COUNT", col("itmqty")), "qty"],
              [
                fn(
                  "SUM",
                  literal("CASE WHEN extprc = 0 THEN amtdis ELSE extprc END")
                ),
                "amtdis",
              ],
            ],
            raw: true,
          }),
          docnum_summ: {
            beg_or:
              (await pos.count({
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  trncde: "POS",
                },
                order: ["recid"],
                attributes: ["ordocnum"],
                raw: true,
              })) > 0
                ? (
                    await pos.findOne({
                      where: {
                        batchnum: batchno,
                        trnstat: 1,
                        trncde: "POS",
                      },
                      order: ["ordocnum"],
                      attributes: ["ordocnum"],
                      raw: true,
                    })
                  ).ordocnum
                : "",
            end_or:
              (await pos.count({
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  trncde: "POS",
                },
                order: [["recid", "DESC"]],
                attributes: ["ordocnum"],
                raw: true,
              })) > 0
                ? (
                    await pos.findOne({
                      where: {
                        batchnum: batchno,
                        trnstat: 1,
                        trncde: "POS",
                      },
                      order: [["ordocnum", "DESC"]],
                      attributes: ["ordocnum"],
                      raw: true,
                    })
                  ).ordocnum
                : "",
          },
          cash_tran_summ: {
            cash: {
              qty: Number(
                await pos.count({
                  where: {
                    batchnum: batchno,
                    trnstat: 1,
                    itmcde: "CASH",
                    void: 0,
                    refund: 0,
                  },
                  group: ["billdocnum"],
                  raw: true,
                })
              ),
              cashsales: cashsales,
            },
            beg_cash: cashfund,
            cash_in: cash_in,
            cash_out: cash_out,
            exp_cash: exp_cash,
            pos_cash: exp_cash,
            end_cash: declaration,
            shortover: declaration - exp_cash,
            excess: Number(
              await pos.sum("extprc", {
                where: {
                  batchnum: batchno,
                  trnstat: 1,
                  postrntyp: "EXCESS",
                  itmcde: "EXCESS",
                  void: 0,
                  refund: 0,
                },
                raw: true,
              })
            ),
          },
          otherpayments: Number(
            await pos.sum("extprc", {
              where: {
                batchnum: batchno,
                trnstat: 1,
                postrntyp: "PAYMENT",
                itmcde: {
                  [Op.ne]: "CASH",
                },
                void: 0,
                refund: 0,
              },
              raw: true,
            })
          ),
        });
      }  
    } catch (err) {
      console.log("\n");
      console.error(err);
      return res.status(500).send(dateRangeResult);
    }

    // End forloop
    // arrDateRangeResult = ._sortBy(arrDateRangeResult, "date")
    dateRangeResult = arrDateRangeResult;
    // _log(dateRangeResult);
    res.send(dateRangeResult);
  });

  return router;
};
