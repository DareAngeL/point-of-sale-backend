const { literal } = require('sequelize');
const express = require("express");
const router = express.Router();
const { modelList } = require("../model/model");
const {
  login,
  changePassword,
  verifyBearerToken,
  passwordEncrypt,
  loginAuthorized,
  accountNumberEncrypt,
} = require("../authentication/authentication");
require("sequelize");
const { Filter } = require("../model");
const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require('../helper/paginate/pagination');
const { _log } = require('../helper');
require("sequelize");

// const userfile = Object.keys(modelList).find(key => object[key]==="pos_userfile");

// eslint-disable-next-line no-undef
module.exports = posUserfileEndpoints = () => {
  const userfile = modelList.pos_userfile.instance;
  const user = userfile.GetInstance();

  router.post("/login", async (req, res) => {
    const useraccess = modelList.useraccess.instance.GetInstance();
    const useraccessmenus = modelList.menus.instance.GetInstance();
    const payload = await login(req.body, userfile, useraccess, useraccessmenus);

    if (payload) res.status(200).json(payload);
    else res.status(401).json({ Status: "Unauthorized" });
  });

  router.post("/authorize_transact", async (req, res) => {
    const isAuthorize = await loginAuthorized(req.body, userfile);

    if (isAuthorize === null) {
      return res.status(404).json(undefined);
    }

    if (isAuthorize) {
      return res.status(200).json({ authorize: true })
    } else {
      return res.status(200).json({ authorize: false })
    }
  });

  router.put("/changepassword", verifyBearerToken, async (req, res) => {

    const changedPass = await changePassword(req.body, userfile);
    if (changedPass && changedPass > 0) {
      res.status(200).json({ changed: true, msg: "Password changed" });
      return;
    }

    res.status(200).json({ changed: false , msg: "Old password is incorrect or user does not exist" });
  });

  router.put("/encryptCardCreds", async (req, res) => {
    const cardCreds = accountNumberEncrypt(req.body);

    const userWithCardCreds = await user.findOne({
      where: {
        cardno: cardCreds.cardno,
        cardholder: literal(`BINARY cardholder = '${cardCreds.cardholder}'`)
      },
      raw: true
    });

    if (userWithCardCreds) {
      res.status(409).json({status: "Card already in use."});
      return;
    }

    res.status(200).json(cardCreds);
  });
 
  /** add and edit users */
  router.put("/", async (req, res) => {
    const useraccess = modelList.useraccess.instance.GetInstance();
    const userreport = modelList.userreport.instance.GetInstance();
    const { ...newUserData } = req.body;
    const encryptedUser = passwordEncrypt(newUserData);

    const findUser = await user.findOne({
      where: { usrcde: encryptedUser.usrcde },  
      raw: true,
    });

    if (findUser && req.query.isAdd === "true") {
      res.status(409).json({ status: "User already exist" });
      return;
    }

    const newUserData2 = {
      ...newUserData,
      ...encryptedUser,
    }
    // create or update useraccess
    if (newUserData.useraccessfiles && newUserData.useraccessfiles.length > 0) {
      const updateColumns = Object.keys(newUserData.useraccessfiles[0]).filter(key => key !== 'recid');

      await useraccess.bulkCreate(newUserData.useraccessfiles, {
        updateOnDuplicate: updateColumns,
      });
    }

    // create or update reportslist
    if (newUserData.reportslist && newUserData.reportslist.length > 0) {

      const existingUserreports = await userreport.findAll({
        where: {
          usercde: newUserData2.usrcde
        }
      })

      let userreporttableData = newUserData.reportslist.map(report => {
        return {
          usercde: newUserData2.usrcde,
          report: report
        }
      });

      if (existingUserreports.length !== userreporttableData.length) {
        await userreport.destroy({
          where: {
            usercde: newUserData2.usrcde
          }
        })

        await userreport.bulkCreate(userreporttableData, {
          updateOnDuplicate: ['usercde', 'report'],
        });
      }
    } else {
      // else if there's no reportlist, delete the record in the table for this user
      await userreport.destroy({
        where: {
          usercde: newUserData2.usrcde
        }
      })
    }

    if (!newUserData2['usrtyp']) {
      newUserData2['usrtyp'] = '';
    }
    // delete unnecessary fields
    delete newUserData2['useraccessfiles'];
    delete newUserData2['c_usrpwd'];
    delete newUserData2['reportslist'];
    if (req.query.isAdd === "false") {
      delete newUserData2['usrpwd'];
    }

    // create or update user
    const updateUserCols = Object.keys(newUserData2).filter(key => key !== 'useraccessfiles' || key !== 'recid' || key !== 'c_usrpwd' || key !== 'usrpwd');
    const created = await user.create(newUserData2, {
      updateOnDuplicate: updateUserCols,
    });

    res.status(200).json({
      ...created.dataValues,
      useraccessfiles: newUserData['useraccessfiles']
    }); 
    
    // try {
    //   const created = await user.create(newUserData2, {
    //     updateOnDuplicate: updateUserCols,
    //   });
  
    //   res.status(200).json({
    //     ...created.dataValues,
    //     useraccessfiles: newUserData['useraccessfiles']
    //   }); 
    // } catch (err) {
    //   if (err.name === "SequelizeUniqueConstraintError") {
    //     res.status(409).json(undefined);
    //   } else {
    //     res.status(500).json(undefined);
    //   }
    // }
  })

  router.get("/", async (req, res) => {
    const { page, pageSize, filters, sort } = req.query;
    const useraccess = modelList.useraccess.instance.GetInstance();

    if (filters) {
      return res.status(200).json(await onFilterPaginate(
        filters,
        userfile.GetInstance(),
        page || 0,
        pageSize || 0,
        undefined,
        { include: useraccess }
      ))
    }

    if (sort) {
      return res.status(200).json(await onSortPaginate(
        sort,
        userfile.GetInstance(),
        page || 0,
        pageSize || 0,
        undefined,
        { include: useraccess }
      ))
    }

    const find = await userfile.GetInstance().findAll(
      paginate({ include: useraccess }, {page: page || 0, pageSize: pageSize || "10"})
    )
    res.status(200).json(find);
  });

  router.get("/rows", async (req, res) => {
    const count = await userfile.GetInstance().count();
    const rows = Math.ceil(count / req.query.pageSize);
    res.status(200).json(rows);
  });

  router.get("/search/:searchTerm", async (req, res) => {
    const {searchTerm} = req.params;
    const {page, pageSize} = req.query;

    res.status(200).json(await onSearch(
      searchTerm,
      "usrcde",
      page || 0,
      pageSize || 0,
      userfile.GetInstance(),
    ));
  });

  router.get("/filter", async (req, res) => {
    const useraccess = modelList.useraccess.instance.GetInstance();

    const filter = new Filter(req.query);

    const filterObj = {
      ...filter.Get(),
      include: [{ model: useraccess }],
    };
    console.log(filter.Get());
    const result = await userfile.ReadMany(filterObj);

    res.status(200).json(result.rows);
  });

  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    const useraccess = modelList.useraccess.instance.GetInstance();
    const userreport = modelList.userreport.instance.GetInstance();

    const deleted = await userfile.Delete({ recid: id });
    // delete also the user access & userreport
    if (deleted) {
      await useraccess.destroy({
        where: {
          usrcde: deleted.dataValues.usrcde,
        }
      })

      await userreport.destroy({
        where: {
          usercde: deleted.dataValues.usrcde
        }
      })

      res.status(200).json(deleted);
      return;
    }

    res.status(404).json(undefined);
  });

  return router;
};
