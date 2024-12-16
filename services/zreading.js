
const { default: axios } = require("axios");
const { modelList } = require("../model/model")

// const headerfile = modelList.headerfile.instance.GetInstance();
// const syspar = modelList.systemparameters.instance.GetInstance();
// const discfile = modelList.discount.instance.GetInstance();
const posfile = modelList.posfile.instance.GetInstance();

const generateConsolidatorZReading = async (req) => {

    const {targetIp} = req.query;

    if(!targetIp)
        return;

    try {
        const findPosfile = await posfile.findAll({
            where: {
            batchnum: "",
            },
            raw: true
        });

        const payloadChunks = chunkify(findPosfile, 5);

        console.log("CHUNKS");

        for(const pChunk of payloadChunks){
            await axios.post(`http://${targetIp}/api/posfile`, pChunk);
        }
        
        // const response = await axios.post(`http://192.168.100.4:8085/api/posfile`, findPosfile);

        // console.log(response.data);
        
    } catch (error) {
        console.log(error);
    }
}

const chunkify = (payload, chunkSize) => {

    let chunks = [];
    let currentChunk = [];


    for(let i = 0; i<payload.length; i++){

        currentChunk.push(payload[i]);

        if(currentChunk.length == chunkSize){
            chunks.push(currentChunk);
            currentChunk = [];
        }
    }

    if(currentChunk.length > 0){
        chunks.push(currentChunk);
    }


    return chunks;

}


module.exports = {
    generateConsolidatorZReading
}

