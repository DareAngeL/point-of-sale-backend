const express = require("express");
const {
  generateRobinson,
  viewList,
  generateStalucia,
} = require("../services/mallhookupService");
const { sftpConnection } = require("../services/sftp");
const { generateMegaworld } = require("../services/hookups/megaworld");
const { modelList } = require("../model/model");
const router = express.Router();

module.exports = mallHookupEndpoints = (sseEmitter) => {

  router.get('/robinsonNotif', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
  
    const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  
    const listener = (data) => sendEvent(data);
    sseEmitter.on('update', listener);
  
    req.on('close', () => {
      sseEmitter.off('update', listener);
      res.end();
    });
  });

  router.post("/robinson", async (req, res) => {
    const { batchnum } = req.body;

    try {
      const genRobinson = await generateRobinson(batchnum);

      if (genRobinson) {
        res.status(200).json();
      } else {
        res.status(400).json();
      }
    } catch (error) {
      const errorMessage = error.toString();
      if (
        errorMessage === "Failed to connect to RLC server" ||
        errorMessage.includes("ECONNRESET")
      ) {
        return res.status(503).json({ status: "failed", message: "" });
      }

      res.status(400).json({ error });
    }

    // Sales file successfully sent to RLC server
  });

  router.post("/stalucia", async (req, res) => {
    const { batchnum, trndte } = req.body;
    console.log("pumasok ba here?? Please");

    try {
      const genStalucia = await generateStalucia(batchnum, trndte);

      res.status(200).json({ genStalucia });
    } catch (error) {
      console.log("Error: HAHAHA", error);
      res.status(400).json({ error });
    }
  });

  router.post("/megaworld", async (req, res) => {
    const { batchnum } = req.body;
    try {
      const genMegaWorld = await generateMegaworld(batchnum);
      res.status(200).json({ genMegaWorld });
    } catch (error) {
      console.log("Error: HAHAHA", error);
      res.status(400).json({ error });
    }
  });

  router.get("/getViewList", async (req, res) => {
    try {
      const mappedListDir = await viewList();
      res.status(200).json(mappedListDir);
    } catch (e) {
      if (e.code && e.code == "ENOENT") {
        res.status(200).json([]);
        return;
      }

      res.status(400).json({ error: e });
    }
  });

  router.get("/getMallFields/:id", async (req, res) => {
    const { id } = req.params;
    const mallhookupfile2 = modelList.mallhookupfile2.instance.GetInstance();
    const mallhookupfile = modelList.mallhookupfile.instance.GetInstance();

    const find = await mallhookupfile.findOne({
      where: {
        recid: id,
      },
      include: [
        {
          model: mallhookupfile2,
          as: "mallfields",
        },
      ],
    });

    res.status(200).json(find);
  });

  router.post("/updateMallFields", async (req, res) => {
    try {
      console.log("req.body", req.body);

      const mallhookupfile2 = modelList.mallhookupfile2.instance.GetInstance();
      await mallhookupfile2.bulkCreate(req.body, {
        updateOnDuplicate: ["value", "is_select"],
      });

      res.status(200).json({ message: "Successfully updated mall fields" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/testRobinsonConnection", async (req, res) => {
    try {
      const sftpCon = await sftpConnection();
      if (sftpCon) {
        res.status(200).json({
          status: "success",
          message: "Successfully connected to Robinsons server",
        });
      } else {
        res.status(200).json({
          status: "failed",
          message: "Failed to connect to Robinsons server",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
