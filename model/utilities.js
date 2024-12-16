// const { initDatabase } = require("../database");
const { modelList } = require("./model");

// initDatabase();

const documentCount = async (query) => {

    const pos = modelList.posfile.instance.GetInstance();  
    const count = await pos.count(
      {
        where: query
      }
    )
    return count;
}

  
module.exports = {documentCount: documentCount}