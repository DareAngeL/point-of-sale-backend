const { paginate, onFilterPaginate, onSortPaginate, onSearch } = require("../helper/paginate/pagination");
const { modelList } = require("../model/model")
const express = require('express');
const router = express.Router();

module.exports = locationfileEndpoints = () => {

    const locationfile = modelList.locationfile.instance;

    router.get("/", async (req, res) =>{
      const {page, pageSize, filters, sort} = req.query;
      const locationfileInst = locationfile.GetInstance();

      if (filters) {
        return res.status(200).json(await onFilterPaginate(
          filters,
          locationfileInst,
          page || 0,
          pageSize || 0,
        ))
      }
  
      if (sort) {
        return res.status(200).json(await onSortPaginate(
          sort,
          locationfileInst,
          page || 0,
          pageSize || 0,
        ))
      }

      const find = await locationfileInst.findAll(
        paginate({}, {page: page || 0, pageSize: pageSize || "10"})
      )

      res.status(200).json(find);
    });

    router.get("/all", async (req, res) => {
      const find = await locationfile.Read();
      res.status(200).json(find);
    });

    router.get("/single/:locationcde", async (req, res) => {
      const {locationcde} = req.params;

      if (locationcde === "") {
        return res.status(400).send(undefined);
      }

      const find = await locationfile.GetInstance().findOne({
        where: {  
          locationcde: locationcde
        }
      });

      res.status(200).json(find);
    });

    router.get("/rows", async (req, res) => {
      const count = await locationfile.GetInstance().count();
      const rows = Math.ceil(count / req.query.pageSize);
      res.status(200).json(rows);
    });

    router.get("/search/:searchTerm", async (req, res) => {
      const {searchTerm} = req.params;
      const {page, pageSize} = req.query;
  
      res.status(200).json(await onSearch(
        searchTerm,
        "locationdsc",
        page || 0,
        pageSize || 0,
        locationfile.GetInstance(),
      ));
    });

    router.post("/", async (req,res) => {
        const {body} = req;
        const create = await locationfile.CreateOrUpdate(body);
        res.status(200).json(create);
    });

    router.put("/", async (req, res)=>{
        const {recid} = req.body;

        const update = await locationfile.CreateOrUpdate({recid : recid}, req.body, "locnum", "locationcde");
        res.status(200).json(update);

    });

    router.delete("/:id", async (req,res)=>{
        const {id} = req.params;

        const deleted = await locationfile.Delete({recid : id});

        res.status(200).json(deleted);
    });

    return router;
}