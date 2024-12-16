const { modelList } = require("../model/model");
const express = require("express");
const { getSequelize } = require('../database');
const { Sequelize } = require("sequelize");
const router = express.Router();

const queryInterface = getSequelize().getQueryInterface();

module.exports = dbConfigEndpoints = () => {
  

  router.get("/getablelist", async (req, res) => {
    const tables = [];
    for (const key in modelList) {
      tables.push(modelList[key].instance.GetInstance().tableName)
    }

    res.status(200).json(tables);
  })

  router.post("/updatestructure", async (req, res) => {
    const { tables, addonlymissingcols } = req.body;

    const getTableColumns = (table) => {
      let cols = [];
      for (const key in modelList) {
        const model = modelList[key];
        const modelInstance = model.instance.GetInstance();
        if (modelInstance.tableName === table) {
          cols = Object.values(modelInstance.rawAttributes)
            .map(value => {
              return {
                type: value.type,
                fieldName: value.fieldName,
                allowNull: value.allowNull,
                autoIncrement: value.autoIncrement || false
              }
            });

          break;
        }
      }
      
      return cols
    }

    const isANumber = (objtype) => {
      return objtype instanceof Sequelize.NUMBER && 
            !(objtype instanceof Sequelize.INTEGER) &&
            !(objtype instanceof Sequelize.BIGINT) &&
            !(objtype instanceof Sequelize.FLOAT) &&
            !(objtype instanceof Sequelize.REAL) &&
            !(objtype instanceof Sequelize.DOUBLE) &&
            !(objtype instanceof Sequelize.DECIMAL);
    }

    console.log("------------UPDATING STRUCTURE--------------");
    // get all the table 
    try {
      for (const table of tables) {
        const cols = getTableColumns(table);

        if (!cols) continue;

        console.log(`--- UPDATING TABLE ${table} ---`)

        for (const col of cols) {

          const tableDefinition = await queryInterface.describeTable(table);
          delete col.type.fieldName;

          // adds a new table column
          if (!tableDefinition[col.fieldName]) {
            queryInterface.addColumn(
              table, 
              col.fieldName, 
              !isANumber(col.type) ? col : 
              {
                type: Sequelize.DECIMAL(),
                allowNull: true,
              }
            );
          } else {
            // update an existing column
            if (!col.type.primaryKey && !addonlymissingcols) {
              console.log("Object Type", col);
              queryInterface.changeColumn(
                table, 
                col.fieldName,
                !isANumber(col.type) ? col : 
                {
                  type: Sequelize.DECIMAL(),
                  allowNull: true,
                }
              );
            }
          }
        }
      }

      console.log("--------------UPDATING STRUCTURE IS COMPLETE!----------------");
      res.status(200).json(true);
    } catch (e) {
      console.error("--------------ERROR UPDATE STRUCTURE!----------------");
      console.error(e);
      res.status(500).json(undefined)
    }
  })

  return router;
}