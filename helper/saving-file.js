
const fs = require('fs');
const { pad } = require('./stringHelper');

const saveFile = (filepath, obj, isIndex, padding) => {
    const stream = fs.createWriteStream(`${filepath}`)

    stream.on('error', err => {
        console.error('Error writing to file:', err);
    });

    Object.values(obj).forEach((val, index) => {

        if(Array.isArray(val)){
            val.forEach((data) => {
                Object.values(data).forEach((el, idx) => {
                    stream.write(`${isIndex?pad(padding, index+idx+2):""}${el}\n`);
                })
            })
        }
        else{
            stream.write(`${isIndex?pad(padding, index+1):""}${val}\n`);
        }
        
    });
    
    stream.end();
}

// const saveFile2

module.exports = {
    saveFile
}