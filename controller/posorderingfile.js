const express = require('express');
const { modelList } = require('../model/model');
const { fixNoOrdocnum } = require('../services/posorderingfile');
const router = express.Router();

module.exports = posfileOrderingEndpoints = () => {
    const posorderingfile = modelList.posorderingfile.instance;
    const posfile = modelList.posfile.instance;

    router.delete('/fixNoOrdocnum', async (req, res) => {
        try {
            // // find all the null ordocnum
            // const nulls = (await posorderingfile.ReadMany({where: {ordocnum: null}, raw: true})).rows;

            // // check every nulls if it's a duplicate one.
            // // if it's a duplicate, delete it , if not, do not delete it cuz it's not covered for this fixation.
            // let fixed = 0;
            // await Promise.all(nulls.map(async elem => {
            //     const dupl = await posorderingfile.GetInstance().findOne({
            //         where: {
            //             itmcde: elem.itmcde,
            //             ordercde: elem.ordercde,
            //             ordocnum: {
            //                 [Op.not]: null
            //             },
            //         }
            //     });

            //     if (dupl) {
            //         await posorderingfile.GetInstance().destroy({
            //             where: {
            //                 ordocnum: null,
            //                 itmcde: elem.itmcde,
            //                 ordercde: elem.ordercde
            //             }
            //         });
            //         fixed++;
            //     }
            // }));

            // if (fixed > 0) {
            //     res.status(200).json({status: 'success'})
            // }
            // else {
            //     res.status(200).json({status: 'failed', message: 'Nothing to fix'})
            // }

            const fixed = await fixNoOrdocnum(posorderingfile, posfile);
            if (fixed) {
                res.status(200).json({status: 'success'})
            }
            else {
                res.status(200).json({status: 'failed', message: 'Nothing to fix'})
            }

        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    });

    return router;
}