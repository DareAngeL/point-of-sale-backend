

const round2decimal = (val) => {

    
    if(!val)
        return 0;

    let returnVal = 0;

    if(typeof val == 'number'){
        returnVal = val.toFixed(2);
    }
    else{
        returnVal = parseFloat(val).toFixed(2);
    }


    return parseFloat(returnVal);


};

module.exports = {
    round2decimal
}