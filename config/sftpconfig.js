const { modelList } = require("../model/model");

const syspar = modelList.systemparameters.instance.GetInstance();
const mallhookupfile2 = modelList.mallhookupfile2.instance.GetInstance();

async function SftpConfig() {
  try {
    //Getting system settings/parameters
    const sysparFind = await syspar.findOne({});
    const activeMall = sysparFind.active_mall;
    const mallFields = await mallhookupfile2.findAll({
      where: { mall_id: activeMall },
    });

    //sftp config
    const sftpConfig = {
      host: mallFields.find((d) => d.label.toLowerCase() === "host").value,
      user: mallFields.find((d) => d.label.toLowerCase() === "username").value,
      password: mallFields.find((d) => d.label.toLowerCase() === "password")
        .value,
      port: mallFields.find((d) => d.label.toLowerCase() === "port").value,
    };

    return sftpConfig;
  } catch (error) {
    console.error("There's a problem on the configuration", error);
  }
}

module.exports = {
  SftpConfig,
};
