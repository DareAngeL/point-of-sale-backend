const { modelList } = require("../model/model");
const cron = require("node-cron");
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

module.exports.autoTransferTransaction = async () => {

  try {
    const posfile = modelList.posfile.instance;
    const specialrequestdetail = modelList.specialrequestdetail.instance.GetInstance();
    let syspar = await modelList.systemparameters.instance
      .GetInstance()
      .findOne({ raw: true })
      
    const headerfile = await modelList.headerfile.instance
      .GetInstance()
      .findOne({ raw: true });

    const branchCode = headerfile.brhcde;

    if (syspar.withtracc === 1) {

      if (syspar.activateautotransfer === 1 && syspar.trnsfrmod === "TIME") {

        console.log(`Auto Transfer: ${syspar.activateautotransfer === 1 ? "ON" : "OFF"}`);
        console.log(`Process Interval: ${syspar.transferinterval} minutes`);

        const transferSched = cron.schedule(
        `*/${syspar.transferinterval} * * * *`,
        // `*/${1} * * * *`,
          async () => {
            console.log("\n--------------------\nTransferring Transaction Started!");
            
            syspar = await modelList.systemparameters.instance
              .GetInstance()
              .findOne({ raw: true });

            if (syspar.withtracc === 0 || syspar.activateautotransfer === 0 || syspar.trnsfrmod !== "TIME") {
              transferSched.stop();
              return;
            }

            try {
              !!(await require("dns").promises.resolve("google.com"));

              console.log("Transferring transaction(s)...");

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
                    return console.error(err);
                  }

                  if (data.success) {
                    await uploadFileToCentral(posfile, data.filename, `${resAxios?.data.central_path}/${data.file}`, docnums, false);
                    console.log(`(${xarr_posfile.length}) posfile(s) transferred.`);
                    console.log("FILE TRANSFERRED SUCCESSFULLY!");
                  }
                });
              }

              if (xarr_posfile.length <= 0) {
                console.log("(0) posfile(s) transferred.");
              }
              
              console.log("--------------------\n");
            } catch (error) {
              console.error("No Internet Connection.", error);
              await modelList.systemparameters.instance
                .GetInstance()
                .update({ is_transferring: 0 }, { where: { recid: 1 } });
            }
          },
          {
            scheduled: true,
          }
        );
        transferSched.start();
      }
    }
  } catch (error) {
    console.error(error.message);
  }

};
