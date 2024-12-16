const { generateTransaction } = require("../services/posfile");

let queue = [];
let isProcessing = false;

const processQueue = async () => {

    if(isProcessing || queue.length === 0) return;


    isProcessing = true;
    const {req,res} = queue.shift();

    await generateTransaction(req,res);
    processQueue();
    isProcessing = false;
}

const enqueue = (data) => {
    queue.push(data);
}

module.exports = {
    enqueue, processQueue, isProcessing
}