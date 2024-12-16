const { autoTransferTransaction } = require("./autotransfertransaction");
const { AutomatedSendingSftpFile } = require("./autosentsftpfile");

module.exports.initScheduler = (sseEmitter) => {
  autoTransferTransaction();
  AutomatedSendingSftpFile(sseEmitter);
};
