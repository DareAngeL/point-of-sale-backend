const express = require("express");
const router = express.Router();
const fs = require('fs');

module.exports = advertisementEndpoints = () => {
  router.get('/', async (req, res) => {
    const {imgsPath} = req.query;

    // get images path inside a folder
    const directoryPath = imgsPath;

    try {
      const files = await fs.promises.readdir(directoryPath);
      const images = files.map(file => file);
      res.status(200).json(images);
    } catch (err) {
      console.log('Unable to scan directory: ' + err);
      res.status(500).json({err: err});
    }    
    
  });

  router.get('/image', async (req, res) => {
    const {imgsPath, imgName} = req.query;
    const directoryPath = imgsPath;

    try {
      const files = await fs.promises.readdir(directoryPath);
      const images = files.map(file => file);
      if (images.includes(imgName)) {
        res.sendFile(`${imgsPath}/${imgName}`);
      } else {
        res.status(404).json({err: `Image not found: ${imgName}`});
      }
    } catch (err) {
      console.log('Unable to scan directory: ' + err);
      res.status(500).json({err: err});
    }    
  });

  return router;
}