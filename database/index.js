const { Sequelize } = require("sequelize");
const { mapTables } = require("../model/model");

const server = process.argv[2];
const user = process.argv[4];
const pass = process.argv[5];
const db = process.argv[6];

let config = require(`../config/config.dev.json`);
let sequelize;

async function initDatabase() {

  if(server){
    config.username = user;
    config.password = pass;
    config.database = db;
  }

  
  if (!sequelize) {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        dialect: config.dialect,
        timezone: "+08:00",
        define: {
          underscored: true,
          freezeTableName: true,
          timestamps: false,
        },
        logging: false,
      }
    );

    mapTables(sequelize);
    // await sequelize.sync(); 
  }
  
  return sequelize;
}

function getSequelize() {
  return sequelize;
}

function setSequelize(newSequelize) {
  sequelize = newSequelize;
}

module.exports = {
  initDatabase: initDatabase,
  getSequelize: getSequelize,
  setSequelize
};
