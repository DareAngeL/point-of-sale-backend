const express = require("express");
const { modelList } = require("../model/model");
const router = express.Router();
const archiver = require("archiver");
!archiver.isRegisteredFormat("zip-encryptable") &&
  archiver.registerFormat(
    "zip-encryptable",
    require("archiver-zip-encryptable")
  );
const { Op } = require("sequelize");
const { default: axios } = require("axios");
const { generateTransferFile } = require("../services/generateTransferFile");
const { uploadFileToCentral } = require("../services/uploadFileToCentral");

module.exports = eodAutoTransferEndPoints = () => {
  router.get("/", async (_, res) => {

    const posfile = modelList.posfile.instance;
    const specialrequestdetail = modelList.specialrequestdetail.instance.GetInstance();
    let syspar = await modelList.systemparameters.instance
      .GetInstance()
      .findOne({ raw: true });
    const headerfile = await modelList.headerfile.instance
      .GetInstance()
      .findOne({ raw: true });

    const branchCode = headerfile.brhcde;

    if (syspar.withtracc === 1) {
      if (syspar.activateautotransfer === 1 && syspar.trnsfrmod !== "TIME") {
        try {
          !!(await require("dns").promises.resolve("google.com"));

            //#region POSFILE
            let xarr_posfile = [];
            let whereFilter = {
              where: {
                trnsfrdte: null,
                trnsfrtime: null,
                trnstat: 1,
              },
            };

            if (syspar.trnsfrdte_start != null) {
              whereFilter = {
                where: {
                  trnsfrdte: null,
                  trnsfrtime: null,
                  trnstat: 1,
                  trndte: {
                    [Op.and]: [
                      {
                        [Op.gte]: syspar.trnsfrdte_start,
                      },
                    ],
                  },
                },
              };
            }

            const xtmp_posfile = await posfile
              .GetInstance()
              .findOne({
                attributes: ["trndte"],
                ...whereFilter,
                group: "trndte",
                order: ["trndte"],
                raw: true,
              });

            if (!xtmp_posfile) {
              xarr_posfile = await posfile
                .GetInstance()
                .findAll({
                  ...whereFilter,
                  include: [{model: specialrequestdetail}],
                  // raw: true,
                });
            } else {
              xarr_posfile = await posfile
                .GetInstance()
                .findAll({
                  where: {
                    trnsfrdte: null,
                    trnsfrtime: null,
                    trnstat: 1,
                    trndte: xtmp_posfile.trndte,
                  },
                  include: [{model: specialrequestdetail}],
                  // raw: true,
                });
            }

            if (xarr_posfile.length > 0) {
              const docnums = xarr_posfile.map(d => d.docnum);
              
              const serverprotocol = syspar.serverprotocol;
              const serveripaddress = syspar.serveripaddress;
              const serverport = syspar.serverport;

              const resAxios = await axios.post(
                `${serverprotocol}://${serveripaddress}:${serverport}/api/getserverdir`,
                {},
                {
                  headers: {
                    // Etong option pwede mo to lagyan ng token para hindi pwedeng ma access agad yung central server
                    "Content-Type": "application/json; charset=utf-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "*",
                    "Access-Control-Allow-Headers": "X-Total-Count",
                    // "Content-Length": Buffer.byteLength(
                    //   JSON.stringify({ connect: "connect" })
                    // ),
                  },
                  params: { brhcde: branchCode },
                }
              );

              let comcde = resAxios?.data.comcde
                ? resAxios.data.comcde
                : "";

              generateTransferFile(posfile, docnums, comcde, false, async (err, data) => {
                if (err) {
                  console.error(err);
                  return res.send({ success: false, message: err });
                }

                if (data.success) {
                  
                  const uploadResult = await uploadFileToCentral(posfile, data.filename, `${resAxios?.data.central_path}/${data.file}`, docnums, false);

                  if (uploadResult.success) {
                    console.log("FILE TRANSFERRED SUCCESSFULLY!");
                    return res.send({ success: true });
                  } else {
                    console.log("FILE TRANSFER UNSUCCESSFUL!");
                    return res.send({ success: false, message: uploadResult.message });
                  }
                }
              });
            }
        } catch (err) {
          console.error("No Internet Connection.", err);
          await modelList.systemparameters.instance
            .GetInstance()
            .update({ is_transferring: 0 }, { where: { recid: 1 } });

          return res.send({ success: false, message: err });
        }
      }
      else {
        return res.send({ success: false, message: "Auto Transfer is not activated." });
      }
    }
  });

  return router;
};
