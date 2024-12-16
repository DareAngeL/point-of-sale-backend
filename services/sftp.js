const Client = require("ssh2-sftp-client");
const { SftpConfig } = require("../config/sftpconfig");

async function fileTransfer(client, filename, destination) {
  try {
    await client.put(filename, destination);
    console.log("File transfer successful");
    return true;
  } catch (error) {
    console.error("File transfer failed:", error);
    return false;
  }
}

async function sftpConnection() {
  try {
    const sftpConfig = await SftpConfig();
    const sftpClient = new Client();
    try {
      await sftpClient.connect(sftpConfig);
      return sftpClient;
    } catch (error) {
      const errorMessage = error.toString();
      if (errorMessage.includes("ECONNRESET")) {
        return undefined;
      }
      throw error;
    }
  } catch (error) {
    console.error("Error while requesting SFTP connection:", error.message);
    return false;
  }
}

module.exports = {
  fileTransfer,
  sftpConnection,
};
