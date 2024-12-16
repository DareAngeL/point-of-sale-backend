const {dateTimeTodayFormatter, _log} = require("../helper");
const {modelList} = require("../model/model");
const { Op } = require("sequelize");
const express = require("express");
const { checkRecallAndCloseTransaction } = require("../services/transaction");
const router = express.Router();

module.exports = transactionEndpoints = () => {
  // const posfile = modelList.posfile.instance.GetInstance();
  const posfile = modelList.posorderingfile.instance.GetInstance();
  const transaction = modelList.transaction.instance;
  const syspar = modelList.systemparameters.instance;
  const modelTransaction = modelList.transaction.instance.GetInstance();
  const orderitemdiscount = modelList.orderitemdiscount.instance.GetInstance();

  router.get("/", async (req, res) => {
    const find = await transaction.Read();
    res.status(200).json(find);
  });

  // get the open transaction from the current day
  router.get("/active", async (req, res) => {
    const trans = modelList.transaction.instance.GetInstance();

    const status = req.query.status;

    if (status) {
      const findActive = await trans.findAll({
        where: {
          status: status
        },
        raw: true
      });

      return res.status(200).json(findActive);
    }

    const findActive = await trans.findOne({
      where: {
        status: {
          [Op.or]: ["RECALL", "OPEN"]
        }
      },
      order: [
        ['status', 'DESC']
      ],
      raw: true
    });

    res.status(200).json(findActive);
  });

  router.get("/hasOpenTable", async (req, res) => {
    const trans = modelList.transaction.instance.GetInstance();
    const openTran = await trans.findOne({
      where: {
        status: {
          [Op.or]: ["OPEN", "HOLD", "RECALL"]
        }
      }
    });

    if (!openTran) {
      return res.status(200).send(undefined);
    }

    res.status(200).json({status: true});
  });

  // get the open transaction from the previous day
  router.get("/prevActive", async (req, res) => {
    const trans = modelList.transaction.instance.GetInstance();

    const findActive = await trans.findOne({
      where: {
        status: {
          [Op.or]: ["OPEN", "HOLD", "RECALL"]
        }
      },
      raw: true
    });

    if (!findActive) {
      return res.status(200).send(undefined);
    }

    const openTime = new Date(findActive.opentime);
    const previousOpenTran = new Date().getDate() - openTime.getDate();

    if (previousOpenTran === 0) {
      return res.status(200).send(undefined);
    }

    res.status(200).send({status: true});
  });

  // get all open transactions regardless of the day
  router.get("/allActiveHold", async (req, res) => {
    const trans = modelList.transaction.instance;

    const transactions = await trans.ReadMany({
      where: {
        status: "HOLD"
      }
    });
    
    res.status(200).json(transactions);
  });

  router.get("/:id", async (req, res) => {
    const {id} = req.params;
    const find = await transaction.ReadOne(id);
    res.status(200).json(find);
  });

  // use to open new table transaction
  router.put("/", async (req, res) => {
    const {recid, ordercde, isCreateTransaction  } = req.body;
    
    // if isCreateTransaction is false, we return the existing open transaction
    if (!isCreateTransaction) {
      const foundTransaction = await transaction.GetInstance().findOne({
        where: {
          status: "OPEN"
        }
      });

      return res.status(200).json(foundTransaction);
    }

    const updatedOrderCode = ordercde
      ? ordercde
      : await transaction.UpdateId("ordercde");
    
    await syspar.UpdateId("posdocnum");
    await syspar.UpdateId("billdocnum");

    const openTime = new Date();

    const updatedObject = {
      ...req.body,
      ordercde: updatedOrderCode,
      opentime: openTime,
    };
    const update = await transaction.CreateOrUpdate(
      {recid: recid},
      updatedObject,
      "seqnum",
      "tabletrncde"
    );

    
    // ===================================================================================================
    // *** AUTO-FIXING OF DOUBLE 'OPEN' TRANSACTION
    // ===================================================================================================
    const foundTransactions = await transaction.GetInstance().findAll({
      where: {
        status: "OPEN"
      },
      order: [["ordercde", "ASC"]],
      raw: true
    });
    // this will only close or holds the other old open transactions, not the latest open transaction
    const changedStatus = {
      hold: [], // [ordercde]
      closed: [] // [ordercde]
    }
    for (let i=0; i<foundTransactions.length-1; i++) {
      const transctn = foundTransactions[i];

      const foundPosOrdering = await posfile.findOne({
        where: {
          ordercde: transctn.ordercde
        }
      });

      // check if the transctn exists in posordering, if it is, then hold the transaction
      if (foundPosOrdering) {
        await transaction.GetInstance().update({status: 'HOLD'}, {where: {ordercde: transctn.ordercde}});
        changedStatus.hold.push(transctn.ordercde);
      }
      // if the transaction does not exist, then mark the status of the transaction as ;CLOSED;
      else {
        await transaction.GetInstance().update({status: 'CLOSED', closetime: dateTimeTodayFormatter()}, {where: {ordercde: transctn.ordercde}});
        changedStatus.closed.push(transctn.ordercde);
      }
    }
    
    res.status(200).json({
      model_data: update,
      changed_status: changedStatus
    });
  });

  router.post("/", async (req, res) => {
    const {body} = req;

    //#region CLOSE OPEN TRANSACTION
    const foundTransaction = await modelTransaction.findOne({
      where: {status: "OPEN"},
    });

    if (foundTransaction) {
      console.log("nani???");
      foundTransaction.status = "CLOSED";
      foundTransaction.closetime = dateTimeTodayFormatter();
      await foundTransaction.save();
    }
    //#endregion

    const create = await transaction.CreateOrUpdate({recid : body.recid}, body);
    res.status(200).json(create);
  });

  router.post("/change_pax", async (req, res) => {

    const {body} = req;

    try {

      const create = await transaction.CreateOrUpdate({recid : body.recid}, body);
      res.status(200).json(create);
      
    } catch (error) {
      res.status(200).json({error: error});
    }
    
  });

  router.post("/manual_close/:tabletrncde", async (req, res) => {
    const { tabletrncde } = req.params
    const listOfPOSTrantyp = [
      "ITEM", "TOTAL", "SERVICE CHARGE", "VATEXEMPT", 
      "LOCALTAX", "VAT 0 RATED", "DISCOUNTABLE", "Less Vat Adj.", "DISCOUNT"
    ]

    try {
      const foundTransaction = await modelTransaction.findOne({
        where: {
          tabletrncde: tabletrncde
        },
      });
  
      if (foundTransaction) {
        console.log("MI GORENT??");
        foundTransaction.status = "CLOSED";
        foundTransaction.closetime = dateTimeTodayFormatter();
        await foundTransaction.save();
      }
  
      await posfile.destroy({
        where: {
          batchnum: "",
          ordercde: foundTransaction.ordercde,
          postrntyp: {
            [Op.or]: listOfPOSTrantyp,
          }
        }
      });

      await orderitemdiscount.destroy({
        where: {
          ordercde: foundTransaction.ordercde
        }
      });
  
      res.status(200).json({success: true});
    } catch (err) {
      console.error(err);
      res.status(500).json({status: false});
    }
  });

  router.post("/cancel", async (req, res) => {
    const listOfPOSTrantyp = [
      "ITEM", "TOTAL", "SERVICE CHARGE", "VATEXEMPT", "DISCOUNT",
      "LOCALTAX", "VAT 0 RATED", "DISCOUNTABLE", "Less Vat Adj."
    ]

    try {
      const transaction = await modelTransaction.findOne({
        where: {
          status: {
            [Op.or]: ["RECALL", "OPEN"]
          }
        },
        order: [
          ['status', 'DESC']
        ],
      });

      // removes the data in posorderingfile table
      await posfile.destroy({
        where: {
          batchnum: "",
          ordercde: transaction.ordercde,
          postrntyp: {
            [Op.or]: listOfPOSTrantyp,
          }
        }
      });

      // check recall and close the transaction
      const recallData = await checkRecallAndCloseTransaction(modelTransaction, res);

      res.status(200).json(recallData);
      // res.status(200).json(transaction);
    } catch (error) {
      console.error(error);
      res.status(404).json({msg: "No Active Transaction"});
    }
  });

  router.post("/cancel-onhold", async (req, res) => {
    const listOfPOSTrantyp = [
      "ITEM", "TOTAL", "SERVICE CHARGE", "VATEXEMPT", 
      "LOCALTAX", "VAT 0 RATED", "DISCOUNTABLE", "Less Vat Adj."
    ]

    try {
      const transactions = await modelTransaction.findAll({
        where: {
          status: "HOLD"
        },
        raw: true
      });

      for (const transaction of transactions) {
        await posfile.destroy({
          where: {
            batchnum: "",
            ordercde: transaction.ordercde,
            postrntyp: {
              [Op.or]: listOfPOSTrantyp,
            }
          }
        });
      }

      await modelTransaction.update({
        status: "CLOSED",
        closetime: dateTimeTodayFormatter()
      }, {
        where: {
          status: "HOLD"
        }
      })

      res.status(200).json({status: true});
    } catch (error) {
      console.error(error);
      res.status(404).json({msg: "No Active Transaction"});
    }
  });

  router.post("/hold", async (req,res)=> {

    try {

      const openTransaction = await modelTransaction.findOne({
        where : {
          tabletrncde : req.body.tabletrncde, 
          status: {
            [Op.or]: ["RECALL", "OPEN"]
          }
        },
      });

      if(openTransaction){
        const status = openTransaction.status;
        let isFromRecall = false;
        let ordercde;

        await openTransaction.update({ status: "HOLD" });
        await openTransaction.save();

        if (status === "RECALL") {
          isFromRecall = true;
          ordercde = await modelTransaction.findOne({
            where: {
              status: "OPEN"
            },
            raw: true
          })
        }

        return res.status(200).json({isHold: true, isFromRecall: isFromRecall, ordercde: ordercde && ordercde.ordercde});
      }

      res.status(200).json({isHold: false})
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  router.post("/check-recall", async (req,res) => {
    // const [recall, openTran] = await Promise.all([
    //   await modelTransaction.findOne({
    //     where:{
    //       status: "RECALL"
    //     }
    //   }),
    //   await modelTransaction.findOne({
    //     where:{
    //       status: "OPEN"
    //     }
    //   })
    // ]);

    // if(recall) {
    //   recall.update({status: "CLOSED", closetime: dateTimeTodayFormatter()});
    
    //   // const openTransaction = await modelTransaction.findOne({
    //   //   where: {
    //   //     status: "OPEN"
    //   //   }
    //   // });

    //   res.status(200).json({
    //     // ...openTransaction,
    //     ...openTran,
    //     isFromRecall: true
    //   });
      
    // }
    // else{
    //   // const openTransaction = await modelTransaction.findOne({
    //   //   where: {
    //   //     status: "OPEN"
    //   //   }
    //   // });
      
    //   if (openTran) {
    //     openTran.update({status: "CLOSED", closetime: dateTimeTodayFormatter()});
    //   }

    //   res.status(200).json({isFromRecall: false});
    // }

    try {
      const data = await checkRecallAndCloseTransaction(modelTransaction);
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

  router.post("/recall/:ordercde", async (req,res) => {

    const {ordercde} = req.params;

    const holdTransaction = await modelTransaction.findOne({where : {status : "HOLD", ordercde : ordercde}});

    if(holdTransaction){

      const recalledTransaction = await modelTransaction.findOne({
        where: {
          status: "RECALL"
        }
      })
      if (recalledTransaction) {
        recalledTransaction.status = "HOLD";
        await recalledTransaction.save();
      }

      holdTransaction.update({ status: "RECALL" });
      await holdTransaction.save();
    }

    res.status(200).json({status : 200});
  });

  router.delete("/:id", async (req, res) => {
    const {id} = req.params;

    const deleted = await transaction.Delete({recid: id});

    res.status(200).json(deleted);
  });

  router.put("/closeTransaction", async (req, res) => {
    const {postypcde, warcde} = req.body;

    //#region CLOSE OPEN TRANSACTION
    const foundTransaction = await modelTransaction.findOne({
      where: {status: "OPEN"},
    });

    // check if the open transaction is the same as the transaction that would about to be opened
    // there's no need to open the same transaction
    if (foundTransaction && foundTransaction.warcde === warcde && foundTransaction.postypcde === postypcde) {
      return res.status(200).json({status: false});
    }

    if (foundTransaction) {
      foundTransaction.status = "CLOSED";
      foundTransaction.closetime = dateTimeTodayFormatter();
      await foundTransaction.save();
    }
    
    //#endregion

    res.status(200).json({status: true});
  });

  return router;
};
