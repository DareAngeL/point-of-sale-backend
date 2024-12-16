const { Op, fn, col, literal } = require("sequelize");
const { modelList } = require("../model/model");
const express = require("express");
const router = express.Router();
const { Filter } = require("../model");

module.exports = eSalesEndPoints = () => {
  const posfile = modelList.posfile.instance;

  router.get("/", async (req, res) => {
    const filter = new Filter(req.query);
    const item = modelList.item.instance.GetInstance();
    const itemclass = modelList.itemclassification.instance.GetInstance();
    const itemsubclass = modelList.itemsubclassification.instance.GetInstance();

    const filterObj = {
      ...filter.Get(),
      include: [{ model: item, include: [itemclass, itemsubclass] }],
    };

    const result = await posfile.ReadMany(filterObj);

    let xarr_pos = [...result.rows];
    let xarr_ordocnum = [];
    for (const items of xarr_pos) {
      const item = items.dataValues;
      if (!xarr_ordocnum.includes(item.ordocnum)) {
        xarr_ordocnum.push(item.ordocnum);
      }
    }

    const scharge_disc = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            itmcde: "SERVICE CHARGE",
            void: 0,
            refund: 0,
          },
          attributes: [[fn("sum", col("amtdis")), "amtdis"]],
          raw: true,
        })
      ).amtdis
    );

    const refundGrossSales = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            postrntyp: "TOTAL",
            refund: 1,
          },
          attributes: [[fn("sum", col("groext")), "groext"]],
          raw: true,
        })
      ).groext
    );

    const refundVatableSales = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            postrntyp: "TOTAL",
            refund: 1,
          },
          attributes: [[fn("sum", col("netvatamt")), "netvatamt"]],
          raw: true,
        })
      ).netvatamt
    );

    const refundVatExempt = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            postrntyp: "TOTAL",
            refund: 1,
          },
          attributes: [[fn("sum", col("vatexempt")), "vatexempt"]],
          raw: true,
        })
      ).vatexempt
    );

    const refundRegDiscount = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            postrntyp: "TOTAL",
            govdisc: 0,
            refund: 0,
          },
          attributes: [[fn("sum", col("amtdis")), "amtdis"]],
          raw: true,
        })
      ).amtdis
    );

    const refundVatAmount = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            postrntyp: "TOTAL",
            refund: 1,
          },
          attributes: [[fn("sum", col("vatamt")), "vatamt"]],
          raw: true,
        })
      ).vatamt
    );

    const grossSales =
      Number(
        (
          await posfile.GetInstance().findOne({
            where: {
              ordocnum: {
                [Op.in]: xarr_ordocnum,
              },
              itmcde: {
                [Op.or]: ["TOTAL", "SERVICE CHARGE"],
              },
              refund: 0,
              void: 0,
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
      ) -
      scharge_disc -
      refundGrossSales;

    const serviceCharge =
      Number(
        (
          await posfile.GetInstance().findOne({
            where: {
              ordocnum: {
                [Op.in]: xarr_ordocnum,
              },
              itmcde: "SERVICE CHARGE",
              void: 0,
              refund: 0,
            },
            attributes: [[fn("sum", col("extprc")), "extprc"]],
            raw: true,
          })
        ).extprc
      ) - scharge_disc;

    const vatAdj = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            itmcde: "Less VAT Adj.",
            void: 0,
            refund: 0,
          },
          attributes: [[fn("sum", col("extprc")), "extprc"]],
          raw: true,
        })
      ).extprc
    );

    const scpwdDiscount = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            itmcde: {
              [Op.or]: ["Senior", "PWD"],
            },
            void: 0,
            refund: 0,
            postrntyp: "DISCOUNT",
          },
          attributes: [[fn("sum", col("extprc")), "extprc"]],
          raw: true,
        })
      ).extprc
    );

    const govDiscount = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            govdisc: 1,
            void: 0,
            refund: 0,
            postrntyp: "DISCOUNT",
          },
          attributes: [[fn("sum", col("extprc")), "extprc"]],
          raw: true,
        })
      ).extprc
    );

    const regDiscount =
      Number(
        (
          await posfile.GetInstance().findOne({
            where: {
              ordocnum: {
                [Op.in]: xarr_ordocnum,
              },
              govdisc: 0,
              void: 0,
              refund: 0,
              postrntyp: "DISCOUNT",
            },
            attributes: [[fn("sum", col("amtdis")), "amtdis"]],
            raw: true,
          })
        ).amtdis
      ) - refundRegDiscount;

    const lessVatAdj = Number(
      (
        await posfile.GetInstance().findOne({
          where: {
            ordocnum: {
              [Op.in]: xarr_ordocnum,
            },
            itmcde: "Less VAT Adj.",
            void: 0,
            refund: 0,
            postrntyp: "Less Vat Adj.",
          },
          attributes: [[fn("sum", col("extprc")), "extprc"]],
          raw: true,
        })
      ).extprc
    );

    const totalSales =
      grossSales - serviceCharge - govDiscount - regDiscount - lessVatAdj;

    const vatableSales =
      Number(
        (
          await posfile.GetInstance().findOne({
            where: {
              ordocnum: {
                [Op.in]: xarr_ordocnum,
              },
              itmcde: "TOTAL",
              void: 0,
              refund: 0,
            },
            attributes: [[fn("sum", col("netvatamt")), "netvatamt"]],
            raw: true,
          })
        ).netvatamt
      ) - refundVatableSales;

    const vatAmount =
      Number(
        (
          await posfile.GetInstance().findOne({
            where: {
              ordocnum: {
                [Op.in]: xarr_ordocnum,
              },
              itmcde: "TOTAL",
              void: 0,
              refund: 0,
            },
            attributes: [[fn("sum", col("vatamt")), "vatamt"]],
            raw: true,
          })
        ).vatamt
      ) - refundVatAmount;

    const vatExemptSales =
      Number(
        (
          await posfile.GetInstance().findOne({
            where: {
              ordocnum: {
                [Op.in]: xarr_ordocnum,
              },
              itmcde: "DISCOUNTABLE",
              void: 0,
              refund: 0,
            },
            attributes: [[fn("sum", col("extprc")), "extprc"]],
            raw: true,
          })
        ).extprc
      ) - refundVatExempt;

    const vatZeroRated = 0;
    const begOR = (
      await posfile.GetInstance().findOne({
        where: {
          ordocnum: {
            [Op.in]: xarr_ordocnum,
          },
          trncde: "POS",
        },
        attributes: ["ordocnum"],
        order: ["ordocnum"],
        raw: true,
      })
    ).ordocnum;
    const endOR = (
      await posfile.GetInstance().findOne({
        where: {
          ordocnum: {
            [Op.in]: xarr_ordocnum,
          },
          trncde: "POS",
        },
        attributes: ["ordocnum"],
        order: [["ordocnum", "DESC"]],
        raw: true,
      })
    ).ordocnum;

    res.send({
      result: result.rows,
      grossSales: grossSales,
      serviceCharge: serviceCharge,
      vatAdj: vatAdj,
      scpwdDiscount: scpwdDiscount,
      govDiscount: govDiscount,
      regDiscount: regDiscount,
      totalSales: totalSales,
      vatableSales: vatableSales,
      vatAmount: vatAmount,
      vatExemptSales: vatExemptSales,
      vatZeroRated: vatZeroRated,
      begOR: begOR,
      endOR: endOR,
    });
  });

  return router;
};
