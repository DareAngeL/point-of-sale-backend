const { Op } = require("sequelize");
const { modelList } = require("../model/model")

const syspar = modelList.systemparameters.instance.GetInstance();
const posfile = modelList.posfile.instance.GetInstance();
const headerfile = modelList.headerfile.instance.GetInstance();

const previousZread = async (trndte) => {

    const currentDate = new Date(trndte);
    
    const previousPosfile = await posfile.findAll({ 
        where: {
            trndte: {
                [Op.lt]: currentDate
            }
        },
        limit: 10,
        order: [['trndte', 'DESC']]
    });

    return previousPosfile;
}

const zReadCount = async (trndte) => {

    const currentDate = new Date(trndte);
    
    const countZread = await posfile.count({ 
        where: {
            trndte: {
                [Op.lt]: currentDate
            },
            postrntyp: "GRANDTOTAL"
        }
    });

    return countZread + 1;
}

module.exports = {previousZread, zReadCount}