const { modelList } = require("../model/model")
const express = require('express');
const router = express.Router();

module.exports = modifierfileEndpoints = () => {

    const modifierfile = modelList.modifierfile.instance;

    router.get("/", async (req, res) =>{
        const find = await modifierfile.Read();
        res.status(200).json(find);
    });

    router.put("/", async (req, res)=>{
        const {recid} = req.body;

        const update = await modifierfile.CreateOrUpdate({recid : recid}, req.body);
        res.status(200).json(update);

    });

    router.delete("/:id", async (req,res)=>{
        const {id} = req.params;

        const deleted = await modifierfile.Delete({recid : id});

        res.status(200).json(deleted);
    });

    return router;
}