const express = require("express");
const { modelList } = require("../model/model");
const router = express.Router();
const Client = require("ssh2-sftp-client");
const path = require("path");
const { fs } = require("file-system");
const { sendMsg } = require("../socket");
const { error } = require("console");

module.exports = downloadMasterFilerEndPoints = () => {

  router.get("/", async (req, res) => {
    const {
      masterpath,
      sync: checkSync,
      masterfile: arrayMasterFile,
    } = req.query;

    const fileNotFound = [];
    let filesDownloaded = 0;

    const syspar = await modelList.systemparameters.instance
      .GetInstance()
      .findOne({ raw: true });
    const header = await modelList.headerfile.instance
      .GetInstance()
      .findOne({ raw: true });
    const pos_masterfile_log = await modelList.masterfilelog.instance
      .GetInstance()
      .findAll({ raw: true });

    // const todayDate = format(new Date(), "yyyy-MM-dd");

    try {
      if (syspar.serverhost === "sftp") {
        // try {
          const sftp = new Client();
          const result = await sftp.connect({
            host: syspar.serveripaddress,
            user: syspar.serverusername,
            password: syspar.serverpassword,
            port: syspar.serverfileport,
          });
          if (result) {
            for (const masterfile of arrayMasterFile) {
              // send message to the client
              sendMsg(
                JSON.stringify([
                  `${masterfile}`,
                  `Preparing ${masterfile}. Please wait...`,
                  'dl'
                ])
              );
  
              const filePath = path.join("./uploads/central/masterfile", masterfile);
              let centralPath;
              try {
                try {
                  await fs.promises.access(filePath);
                } catch (err) {
                  await fs.promises.mkdir(filePath, { recursive: true });
                }
                centralPath =
                  masterfile === "tenant" || masterfile === "pricelist"
                    ? `${masterpath}/${masterfile}/${header.brhcde}`
                    : `${masterpath}/${masterfile}`;
              } catch (err) {
                console.error(`[_app.js]: ${err}`)
              }
              
              if (await sftp.exists(centralPath)) {
                let centralListOfFiles;
                try {
                  centralListOfFiles = await sftp.list(centralPath);
                } catch (err) {
                  if (err.message.includes("No such file")) {
                    fileNotFound.push(centralPath);
                    continue;
                  }
                }
  
                if (!checkSync || !checkSync.includes(masterfile)) {
                  continue;
                }
  
                if (masterfile != "pricelist") {
  
                  await processNonPricelist(
                    sftp,
                    centralPath,
                    filePath,
                    pos_masterfile_log,
                    masterfile,
                    centralListOfFiles,
                    (fileDls) => {
                      filesDownloaded = fileDls;
                    }
                  )
                } else {
                  // else if price list
                  if (centralListOfFiles.length > 0) {
                    try {
                      await processPricelist(
                        sftp,
                        masterfile,
                        centralListOfFiles,
                        centralPath,
                        filePath,
                        (fileDls) => {
                          filesDownloaded = fileDls;
                        }
                      )
                    } catch (err) {
                      console.error(err);
                      return res.send({
                        success: false,
                        msg: err.message
                      })
                    }
                  }
                }
              } else {
                return res.send({
                  success: false,
                  msg: `Central path does not exists: ${centralPath}`
                })
              }
            }
          }
  
          res.send({
            success: true,
            filesNotFound: fileNotFound,
            filesDownloaded: filesDownloaded
          });
      } else {
        // else if localhost or not sftp
        // TODO - UPDATE THE STANDALONE OR THE LOCALHOST SYNCING ALSO.
        try {
          for (const masterfile of arrayMasterFile) {
            const filePath = path.resolve(
              `./uploads/central/masterfile/${masterfile}`
            );
            if (!fs.existsSync(filePath)) {
              fs.mkdirSync(filePath, { recursive: true }, (err) =>
                console.error(`[_app.js]: ${err}`)
              );
            }
            let centralPath = `${masterpath}/${masterfile}`;
            if (masterfile === "tenant" || masterfile === "pricelist") {
              centralPath = `${masterpath}/${masterfile}/${syspar.brhcde}`;
            }
            if (fs.existsSync(centralPath)) {
              for (const fileContent of fs.readdirSync(centralPath)) {
                if (masterfile != "pricelist") {
                  const masterfilelog = pos_masterfile_log.filter(
                    (e) => e.tablename == masterfile
                  );
  
                  for (const file of fileContent) {
                    if (masterfilelog.length > 0) {
                      if (
                        parseFloat(file.name.split(".")[0]) >
                        parseFloat(masterfilelog[0].filelog)
                      ) {
                        fs.copyFile(
                          `${centralPath}/${xfile}`,
                          `${filePath}/${file}`,
                          (err) => {
                            if (err) console.error("Error ", err);
                          }
                        );
                      }
                    } else {
                      fs.copyFile(
                        `${centralPath}/${file}`,
                        `${filePath}/${file}`,
                        (err) => {
                          if (err) console.error("Error ", err);
                        }
                      );
                    }
                  }
                } else {
                  const year = file.substring(0, 4);
                  const month = file.substring(4, 6);
                  const day = file.substring(6, 8);
  
                  // if (folderToDate >= todayDate) {
                  for (const file of fs.readdirSync(
                    `${centralPath}/${fileContent}`
                  )) {
                    if (!fs.existsSync(`${filePath}/${fileContent}`)) {
                      fs.mkdirSync(
                        `${filePath}/${fileContent}`,
                        { recursive: true },
                        (err) => console.error(`[_app.js]: ${err}`)
                      );
                    }
  
                    fs.copyFile(
                      `${centralPath}/${fileContent}/${file}`,
                      `${filePath}/${fileContent}/${file}`,
                      (err) => {
                        if (err) console.error("Error ", err);
                      }
                    );
                  }
                  // }
                }
              }
            }
          }
  
          res.send({
            success: true,
          });
        } catch (error) {
          res.send({
            success: false,
            message: error.message,
          });
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({
        success: false,
        msg: err.message
      })
    }
  });

  const processNonPricelist = async (
    sftp, 
    centralPath, 
    filePath, 
    pos_masterfile_log, 
    masterfile,
    centralListOfFiles,
    onComplete
  ) => {
    let filesDownloaded = 0;
    const masterfilelog = pos_masterfile_log.filter(
      (e) => e.tablename == masterfile
    );
    
    const centralLatestFile = centralListOfFiles.sort((a, b) => {
      return parseFloat(a.name.split(".")[0]) - parseFloat(b.name.split(".")[0]);
    })[centralListOfFiles.length - 1];

    if (centralListOfFiles.length > 0 && masterfilelog.length > 0) {

      // for (const file of centralListOfFiles) {
      // send message to the client to tell that we are downloading
      sendMsg(
        JSON.stringify([
          `${masterfile}`,
          `Downloading latest ${masterfile}...`,
          'dl'
        ])
      )

      let fileName = parseFloat(centralLatestFile.name.split(".")[0]);
      if (fileName > parseFloat(masterfilelog[0].filelog)) {
        filesDownloaded++;
        await sftp.get(
          `${centralPath}/${centralLatestFile.name}`,
          `${filePath}/${centralLatestFile.name}`
        );
      }
  
      // }
    } else if (centralListOfFiles.length > 0) { // handle the case when masterfilelog is empty
      // for (const file of centralListOfFiles) {
      // send message to the client to tell that we are downloading
      sendMsg(
        JSON.stringify([
          `${masterfile}`,
          `Downloading latest ${masterfile}...`,
          'dl'
        ])
      )
  
      filesDownloaded++;
      await sftp.get(
        `${centralPath}/${centralLatestFile.name}`,
        `${filePath}/${centralLatestFile.name}`
      );
      // }
    }

    onComplete(filesDownloaded);
  }

  const processPricelist = async (
    sftp,
    masterfile,
    fileContent,
    centralPath,
    filePath,
    onComplete,
  ) => {
    let fileContentLength = fileContent.length;
    let filesDownloaded = 0;
    
    if (fileContentLength > 0) {
      filesDownloaded = await downloadDir(sftp, centralPath, filePath, masterfile)
    }

    onComplete(filesDownloaded);
  }

  // recursive function
  const downloadDir = async (sftp, remoteDir, localDir, masterfile) => {
    const files = await sftp.list(remoteDir);

    let filesDLs = 0;
    const fileType = files[0].type;
    // if it's a directory
    if (fileType === 'd') {
      const latestFolder = files.sort((a, b) => {
        return parseFloat(a.name) - parseFloat(b.name);
      })[files.length - 1];

      const localPath = path.join(localDir, latestFolder.name);
      fs.mkdirSync(localPath, { recursive: true });
      filesDLs = await downloadDir(sftp, `${remoteDir}/${latestFolder.name}`, localPath, masterfile);
    } else {
      // else if it's a file
      // const latestFile = files.sort((a, b) => {
      //   return parseFloat(a.name.split(".")[0]) - parseFloat(b.name.split(".")[0]);
      // })[files.length - 1];

      // loop through the files and download them
      for (const file of files) {

        sendMsg(
          JSON.stringify([
            `${masterfile}`,
            `Downloading ${remoteDir}/${file.name}...`,
            'dl'
          ])
        );
  
        const localPath = path.join(localDir, file.name);
        await sftp.get(`${remoteDir}/${file.name}`, localPath);
        filesDLs++;
      }
    }

    // for (let file of files) {
    //   const localPath = path.join(localDir, file.name);
    //   // if it's a directory
    //   if (file.type === 'd') {
    //     fs.mkdirSync(localPath, { recursive: true });
    //     filesDLs = await downloadDir(sftp, `${remoteDir}/${file.name}`, localPath, masterfile);
    //   } else {
    //     sendMsg(
    //       JSON.stringify([
    //         `${masterfile}`,
    //         `Downloading ${remoteDir}/${file.name} / ${filesDLs+1} out of ${files.length} files`,
    //         'dl'
    //       ])
    //     );
    //     await sftp.get(`${remoteDir}/${file.name}`, localPath);
    //     filesDLs++;
    //   }
    // }

    return filesDLs;
  }

  return router;
};
