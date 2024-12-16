const { modelList } = require("../model/model")
const express = require('express');
const router = express.Router();

module.exports = headerfileEndpoints = () => {

    const headerfile = modelList.headerfile.instance;

    router.get("/", async (req, res) =>{
        const find = await headerfile.Read();
        res.status(200).json(find);
    });

    router.put("/", async (req, res)=>{
        const {recid} = req.body;

        const update = await headerfile.Update({recid : recid}, req.body);
        res.status(200).json(update);

    });

    router.delete("/:id", async (req,res)=>{
        const {id} = req.params;

        const deleted = await headerfile.Delete({recid : id});

        res.status(200).json(deleted);
    });

    return router;
}