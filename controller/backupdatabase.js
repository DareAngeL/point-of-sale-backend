const express = require("express");
const router = express.Router();
const config = require("../config/config.dev.json");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const archiver = require("archiver");
const downloadDirectory = path.join(os.homedir(), "Downloads");

const tryGetDateStr = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const timestamp = now.getTime();
  return `${year}${month}${day}_${timestamp}`;
};

const dumpDatabase = async (backupFilePath) => {
  const mysqldumpCommand = `mysqldump -u ${config.username} -p${config.password} --default-character-set=utf8mb4 -N --routines --skip-triggers --single-transaction --quick --databases "${config.database}" > "${backupFilePath}"`;
  const mysqldumpProcess = spawn(mysqldumpCommand, { shell: true });

  console.log("----------------------");
  console.log("Dumping database...");
  console.log("----------------------");
  console.log('\n');

  return new Promise((resolve, reject) => {
    mysqldumpProcess.stdout.on("data", (data) => {
      console.log(`Output: ${data}`);
    });

    mysqldumpProcess.stderr.on("data", (data) => {
      fs.unlink(backupFilePath, () => {
        reject(`Error: ${data}`);
      });
    });

    mysqldumpProcess.on("close", async (code) => {
      if (code === 0) {
        resolve(true);
        console.log("----------------------");
        console.log("Database dumping completed!");
        console.log("----------------------");
        console.log('\n');
        console.log("----------------------");
        console.log("Compressing the dumped sql file...");
        console.log("----------------------");
        console.log('\n');

        const output = fs.createWriteStream(backupFilePath + ".zip");
        output.on('close', function() {
          console.log("----------------------");
          console.log("Compressing sql file completed!");
          console.log(archive.pointer() + ' total bytes');
          console.log("----------------------");
          // unlink the sql file
          fs.unlink(backupFilePath, () => {
            // resolve(true);
          });
        });
        
        const archive = archiver("zip-encryptable", {
          zlib: { level: 1 },
          forceLocalTime: true,
          password: `DareAngeL@2016`,
        });

        archive.on('warning', function(err) {
          if (err.code === 'ENOENT') {
            // log warning
            console.log(err);
          } else {
            // throw error
            console.error(err);
            
          }
        });

        archive.on('error', function(err) {
          console.error(err);
        });

        archive.pipe(output);
        archive.file(backupFilePath, {
          name: path.basename(backupFilePath),
        });
        await archive.finalize();
      } else {
        console.error(`Child process exited with code ${code}`);
      }
    });
  });
};

const checkIfSnapshot = async () => {
  return new Promise((resolve, reject) => {
    try {
      const defaultFolderPath = path.join(__dirname, "../BackupData");
      if (!fs.existsSync(defaultFolderPath))
        fs.mkdirSync(defaultFolderPath);

      resolve(false);
    } catch (error) {
      if (error.toString().includes("Cannot mkdir in a snapshot")) {
        resolve(true);
      } else {
        console.error(error);
        reject(error);
      }
    }
  });
}

module.exports = backupDatabaseEndPoints = () => {
  router.get("/", async (req, res) => {
    const {path: designatedPath} = req.query;
    const timestamp = tryGetDateStr();

    try {
      let defaultFolderPath = path.join(__dirname, "../BackupData");
      const customFolderPath = path.join(designatedPath, "/BackupData");

      if (await checkIfSnapshot()) {
        // if a snapshot is detected
        defaultFolderPath = path.join(process.cwd(), "/BackupData");
      }

      if (!fs.existsSync(defaultFolderPath)) {
        fs.mkdirSync(defaultFolderPath);
      }
      if ((designatedPath && designatedPath !== "") && !fs.existsSync(designatedPath)) {
        fs.mkdirSync(designatedPath, {recursive: true});
      }
      if (!fs.existsSync(customFolderPath)) {
        fs.mkdirSync(customFolderPath);
      }

      const backupFolderPath = (designatedPath && designatedPath !== "")
        ? customFolderPath
        : defaultFolderPath;
      const backupFilePath = path.join(
        backupFolderPath,
        `backupdatabase_${timestamp}.sql`
      );

      // mysqldump({
      //   connection: {
      //     host: config.host,
      //     user: config.username,
      //     password: config.password,
      //     database: config.database,
      //   },
      //   dumpToFile: backupFilePath,
      //   compressFile: true,
      // });

      await dumpDatabase(backupFilePath);

      res.status(200).json({
        msg: "Backup Successful.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({msg: "Custom File Path Not Found."});
    }
  });
  return router;
};
