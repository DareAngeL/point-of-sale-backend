
const express = require("express");
const { previousZread, zReadCount } = require("../services/managers-report");
const router = express.Router();


module.exports = managersReportEndpoints = () => {
    

    router.get("/previous-zread", async (req, res) => {

        const {trndte} = req.query

        try {
            const prevZread = await previousZread(trndte);
            res.status(200).json(prevZread);
            
        } catch (error) {
            res.status(500).json({Error: error});
        }

    });

    router.get("/count-zread", async (req, res) => {

        const {trndte} = req.query

        try {
            const countZread = await zReadCount(trndte);
            res.status(200).json({count: countZread});
            
        } catch (error) {
            res.status(500).json({Error: error});
        }

    });

    return router;

}