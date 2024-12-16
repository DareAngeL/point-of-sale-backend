const { Op } = require("sequelize");
const { modelList } = require("../model/model");
const Client = require("ssh2-sftp-client");
const { format } = require("date-fns");
const { fs } = require("file-system");
const unzipper = require("unzipper");
const { sendMsg } = require("../socket");

const uploadFileToCentral = async (posfile, filename, centralFilename, docnums, sendSocketMsg) => {
  const syspar = await modelList.systemparameters.instance
      .GetInstance()
      .findOne({ raw: true });

    sendSocketMsg && sendMsg('Connecting to central...')

    if (syspar.serverhost === "sftp") {
      try {
        const sftp = new Client();
        const result = await sftp.connect({
          host: syspar.serveripaddress,
          user: syspar.serverusername,
          password: syspar.serverpassword,
          port: syspar.serverfileport,
        });

        const isCorrupted = await checkFileIfCorrupted(filename);
        if (isCorrupted) {
          await posfile.GetInstance().update(
            {
              is_corrupted: 1,
            },
            {
              where: {
                docnum: { [Op.in]: docnums },
              },
            }
          );

          return {
            success: false,
            message: 'File corrupted!',
          };
        }

        if (result) {
          
          sendSocketMsg && sendMsg('Transferring the generated data to central...')

          try {
            const updated = await posfile.GetInstance().update(
              {
                trnsfrdte: format(new Date(), "yyyy-MM-dd"),
                trnsfrtime: format(new Date(), "hh:ss:mm"),
              },
              {
                where: {
                  docnum: { [Op.in]: docnums },
                },
              }
            );

            if (updated[0] === 0) {
              return {
                success: false,
                message: 'Unable to update the table.',
              }
            }

            await sftp.put(filename, centralFilename);

            fs.unlinkSync(filename);
            fs.unlinkSync(filename.replace(".zip", ".txt"));

            return {
              success: true,
            };
          } catch (error) {
            console.error("Unable to transfer the file to server.");
            console.error(error);
            console.error(error.code);
          }
        }
      } catch (error) {
        console.error("Unable to connect to the file server.", error);
        
        return {
          success: false,
          message: 'Unable to connect to the file server. Please contact support.',
        };
      }
    } else {
      fs.copyFile(filename, centralFilename, async (err) => {
        if (err) {
          return {
            isCorrect: false,
            message: "Unable to transfer the file to server.",
            errcode: err.code,
          };
        } else {
          await modelList.posfile.instance.GetInstance().update(
            {
              trnsfrdte: format(new Date(), "yyyy-MM-dd"),
              trnsfrtime: format(new Date(), "hh:ss:mm"),
            },
            {
              where: {
                docnum: { [Op.in]: docnums },
              },
            }
          );

          fs.unlinkSync(filename);
          fs.unlinkSync(filename.replace(".zip", ".txt"));

          return {
            success: true,
          };
        }
      });
    }
}

const checkFileIfCorrupted = async (filePath) => {
  try {
    const directory = await unzipper.Open.file(filePath);
    await directory.files[0].buffer("DareAngeL@2016");

    return false;
  } catch (error) {
    console.error(error);
    return true;
  }
}

module.exports = {uploadFileToCentral};