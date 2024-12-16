const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const initEndpoints = require("./controller");
const { initDatabase } = require("./database");
const { initScheduler } = require("./scheduler");
const config = require("./config/config.dev.json");
const { initSocketServer } = require("./socket");
const EventEmitter = require('events');

const app = express();
const sseEmitter = new EventEmitter();
const port = process.env.PORT || "8080";

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

async function initServer() {
  initDatabase();
  initEndpoints(app, sseEmitter);
  initScheduler(sseEmitter);

  console.log(`Server is running on port ${port}`);
  const server = app.listen(port);
  initSocketServer(server);
}

initServer();
