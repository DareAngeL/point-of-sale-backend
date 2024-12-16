const express = require("express");
const router = express.Router();
const path = require("path");
const { fs } = require("file-system");
const unzipper = require("unzipper");
const { initDatabase } = require("../database/index");
const { modelList } = require("../model/model");
const { format } = require("date-fns");
const { sendMsg } = require("../socket");

module.exports = syncMasterFileEndPoints = () => {
  let log_file;
  let qErrsCount = 0;

  router.get("/", async (req, res) => {
    const { masterfile: arrayMasterFile } = req.query;
    qErrsCount = 0;
    log_file = fs.createWriteStream(path.resolve('./uploads/syncing_errors.log'), {flags: 'w'});

    let filesFound = 0;
    for (const masterfile of arrayMasterFile) {
      const filePath = path.resolve(
        `./uploads/central/masterfile/${masterfile}`
      );
      // send message to the client
      sendMsg(
        JSON.stringify([
          `${masterfile}`,
          `Preparing. Please wait...`,
          'sync'
        ])
      );

      
      if (fs.existsSync(filePath)) {
        if (masterfile != "pricelist") {
          await processNonPricelist(filePath, masterfile, 
            (filesExistsCount) => {
              filesFound = filesExistsCount;
            },
            (err) => {}
          );
        } else {
          await processPricelist(filePath, masterfile, (filesExistsCount) => {
            filesFound = filesExistsCount;
          })
        }
      }
    }

    log_file.close();

    res.send({
      success: true,
      filesFound: filesFound
    });
  });

  const processNonPricelist = async (filePath, masterfile, onComplete, onError) => {
    const sequelize = await initDatabase();

    let filesExistsCount = 0;
    
    let listFiles = await fs.promises.readdir(filePath);
    listFiles.sort((a, b) => a.localeCompare(b));

    for (const file of listFiles) {
      filesExistsCount++;
        
      try {
        const directory = await unzipper.Open.file(`${filePath}/${file}`);
        const extracted = await directory.files[0].buffer("DareAngeL@2016");
        if (directory.files.length > 0) {

          const fileContent = JSON.parse(extracted.toString());
          let countQueries = 0;
          let tobeCompletedQueries = 200;
          const maxQueryBeforeSendingMsg = 200;
          for (const query of fileContent) {
            countQueries++;

            if (countQueries === tobeCompletedQueries) {
              tobeCompletedQueries += fileContent.length - countQueries < maxQueryBeforeSendingMsg ? fileContent.length : maxQueryBeforeSendingMsg;
              sendMsg(JSON.stringify([
                masterfile, 
                `Syncing ${filesExistsCount} out of ${listFiles.length} files. Completed query ${countQueries} of ${fileContent.length}`, 
                "sync"
              ]));
            }
            
            await sequelize.query(query).catch((error) => {
              console.error(error);
              log_file.write(
                `[ERROR #${++qErrsCount}]\n` + JSON.stringify(error, null, 2) + "\n\n"
              );
            });
          }

          const count = await modelList.masterfilelog.instance
            .GetInstance()
            .count({ where: { tablename: masterfile } });

          count > 0
            ? await modelList.masterfilelog.instance
                .GetInstance()
                .update(
                  { filelog: file.split(".")[0] },
                  {
                    where: { tablename: masterfile },
                  }
                )
            : await modelList.masterfilelog.instance.GetInstance().create({
                filelog: file.split(".")[0],
                tablename: masterfile,
              });

          await fs.promises.unlink(`${filePath}/${file}`);
        }

      } catch (error) {
        console.error(error);
        onError(error);
        log_file.write(
          `[ERROR #${++qErrsCount}]\n` + JSON.stringify(error, null, 2) + "\n\n"
        );
      }
    }

    onComplete(filesExistsCount);
  }

  const processPricelist = async (filePath, masterfile, onComplete) => {
    let filesExistsCount = 0;

    filesExistsCount = await readExecFiles(filePath, masterfile, filesExistsCount);

    onComplete(filesExistsCount);
  }

  // recursive function
  const readExecFiles = async (dirPath, masterfile, _filesExists) => {
    const sequelize = await initDatabase();

    const files = await fs.promises.readdir(dirPath);
    let fileCount = 0;
    let filesExists = _filesExists;

    for (let file of files) {
      filesExists++;
      const filePath = path.join(dirPath, file);
  
      if (fs.statSync(filePath).isDirectory()) {
        // traverse through the directories
        filesExists = await readExecFiles(filePath, masterfile, filesExists);
        await fs.promises.rmdir(filePath);
      } else {
        // read the file here
        const fileName = path.basename(filePath, path.extname(filePath));
        const date = fileName.substring(0, 8);
        // if the file is less than or equal to current day then sync it.
        if (date <= format(new Date(), "yyyyMMdd")) {
          const unzippedFile = await unzipper.Open.file(filePath);
          const extractedFile = await unzippedFile.files[0].buffer("DareAngeL@2016");
          const fileContent = JSON.parse(extractedFile.toString());
          let countQueries = 0;
          let tobeCompletedQueries = 200;
          const maxQueryBeforeSendingMsg = 200;

          for (const query of fileContent) {

            if (countQueries === tobeCompletedQueries) {
              tobeCompletedQueries += fileContent.length - countQueries < maxQueryBeforeSendingMsg ? fileContent.length : maxQueryBeforeSendingMsg;
              sendMsg(
                JSON.stringify([
                  masterfile,
                  `Syncing ${filePath}. ${fileCount+1} out of ${files.length} files. 
                  Completed query ${countQueries+1} of ${fileContent.length}`,
                  "sync",
                ])
              );  
            }
            
            await sequelize.query(query).catch((error) => {
              console.error(error);
              // log_file.write(
              //   `[ERROR #${++qErrsCount}]\n` + JSON.stringify(error, null, 2) + "\n\n"
              // );
            });

            countQueries++;
          }

          const count = await modelList.masterfilelog.instance
            .GetInstance()
            .count({ where: { tablename: masterfile } });
          count > 0
            ? await modelList.masterfilelog.instance
                .GetInstance()
                .update(
                  { filelog: file.split(".")[0] },
                  {
                    where: { tablename: masterfile },
                  }
                )
            : await modelList.masterfilelog.instance.GetInstance().create({
                filelog: file.split(".")[0],
                tablename: masterfile,
              });

          await fs.promises.unlink(filePath);
        }

        fileCount++;
      }
    }

    return filesExists;
  }

  return router;
};
