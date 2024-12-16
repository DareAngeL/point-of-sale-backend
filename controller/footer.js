const { modelList } = require("../model/model")
const express = require('express');
const router = express.Router();

module.exports = footerEndpoints = () => {

    const footer = modelList.footer.instance;

    router.get("/", async (req, res) =>{
        const find = await footer.Read();
        res.status(200).json(find);
    });

    router.put("/", async (req, res)=>{
        const {recid} = req.body;

        const update = await footer.Update({recid : recid}, req.body);
        res.status(200).json(update);

    });

    router.delete("/:id", async (req,res)=>{
        const {id} = req.params;

        const deleted = await footer.Delete({recid : id});

        res.status(200).json(deleted);
    });

    return router;
}