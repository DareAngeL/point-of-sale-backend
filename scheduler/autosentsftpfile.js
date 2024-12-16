const cron = require("node-cron");
const { modelList } = require("../model/model");
const { generateRobinson } = require("../services/mallhookupService");

const jobs = new Map();

const AutomatedSendingSftpFile = async (sseEmitter) => {
  try {
    const syspar = modelList.systemparameters.instance.GetInstance();
    const mallhookupfile = modelList.mallhookupfile.instance.GetInstance();
    const forftpfile = modelList.forftpfile.instance.GetInstance();

    const sysparFind = await syspar.findOne({});
    const activeMall = sysparFind.active_mall;
    const mallhookup = await mallhookupfile.findOne({
      where: { recid: activeMall },
    });

    if (!mallhookup) {
      throw new Error("No Mallhookup Setup");
    }

    if (mallhookup.mallname === "Robinsons") {
      if (!jobs.has('RobinsonsSFTPJob')) {
        const job = cron.schedule(
          `0 0 0-23 * * *`, //Every hour
          // `*/10 * * * * *`, //10 sec for testing
          async () => {
            console.log("Checking for unsent SFTP files...");

            const unsentFiles = await forftpfile.findAll({
              attributes: ["salesdte", "batchnum"],
              where: { datesent: new Date("1970-01-01T00:00:00") },
            });

            if (unsentFiles.length > 0) {
              console.log(`Found ${unsentFiles.length} unsent files.`);

              for (const file of unsentFiles) {
                try {
                  await generateRobinson(file.batchnum);
                  console.log(`Successfully sent batch: ${file.batchnum}`);

                  // 10 sec every batch
                  await new Promise((resolve) => setTimeout(resolve, 10000));
                } catch (error) {
                  console.error(`Error sending batch: ${file.batchnum}`, error);
                }
              }

              console.log("Done sending all unsent SFTP files.");
              sseEmitter.emit('update', { message: "Trying to send unsent files…successful" });
            } else {
              console.log("No unsent files found.");
            }
          },
          { scheduled: true }
        );

        jobs.set('RobinsonsSFTPJob', job);
      } else {
        console.log("Cron job for Robinsons SFTP is already scheduled.");
      }
    }
  } catch (error) {
    console.error("Error in AutomatedSendingSftpFile:", error);
  }
};

module.exports = {
  AutomatedSendingSftpFile,
};
