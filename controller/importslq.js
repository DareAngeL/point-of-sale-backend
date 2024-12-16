const express = require("express");
const router = express.Router();
const multer = require("multer");
const config = require("../config/config.dev.json");
const mysql = require("mysql2");

// Multer configuration
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({storage: storage});

const db = mysql.createPool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = importSqlEndpoints = () => {
  router.post("/", upload.single("file"), async (req, res) => {
    try {
      const fileBuffer = req.file.buffer; // Access the file content from buffer

      if (fileBuffer) {
        const fileContent = fileBuffer.toString(); // Convert buffer to string

        console.log("laman", fileContent);

        db.query(fileContent, (err, results) => {
          if (err) {
            console.error(err);
            switch (err.code) {
              case "ER_DUP_ENTRY":
                // const match = err.message.match(/for key '(.+)'/);
                // const duplicateKey = match ? match[1] : null;

                const match = err.message.match(
                  /Duplicate entry '(.+)' for key/
                );
                const duplicateValue = match ? match[1] : null;

                res.status(400).json({
                  //   error: `Duplicate entry found. Duplicate key: ${duplicateKey}`,
                  error: `Duplicate entry found. Duplicate value: ${duplicateValue}`,
                });
                break;
              case "ER_PARSE_ERROR":
                console.log("Invalid SQL query");

                res.status(400).json({
                  error: "Invalid File. Unable to import data.",
                });
                break;
              default:
                res.status(500).json({error: "Failed to Import file data."});
                break;
            }
          } else {
            console.log("Query executed successfully");
            res
              .status(200)
              .json({message: "Query executed successfully", results});
          }
        });
      } else {
        res.status(400).json({error: "No file content in the request body"});
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });

  return router;
};
