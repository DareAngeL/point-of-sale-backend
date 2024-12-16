
function mallHookupStringFormatter(index, content) {

    const indexing = pad(2, index);
    return indexing.concat(pad(16, content));

}

function pad(padSpace, content) {

    return String(content).padStart(padSpace, 0);

}

function roundUpTwoDigits(num){
    return Number(Math.round(Number(num+'e2'))+'e-2')
}

function roundUpTwoDigitsV2(num){


    const numString  = Number(Math.round(Number(num + 'e2')) + 'e-2').toFixed(2).toString();
    return numString.split(".").join("");
}

function lastFourDigits(num) {

    const numToString = String(num);
    if(numToString.length < 4) return numToString;

    return String(numToString).substring(numToString.length - 4 ,numToString.length);
}

function formatNumberData(number){

    if(typeof number === 'number'){
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    return number;
}

function formatNumberDataV2(number){
    if(typeof number === 'number'){
        return number.toFixed(2);
    }
}


const base62Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function toBase62(buffer) {
    let num = BigInt('0x' + buffer.toString('hex'));
    let base62 = '';
    
    while (num > 0) {
        base62 = base62Chars[num % 62n] + base62;
        num = num / 62n;
    }
    
    while (base62.length < 6) {
        base62 = '0' + base62;
    }
    
    return base62;
}


module.exports = {
    mallHookupStringFormatter,
    pad,
    roundUpTwoDigits,
    lastFourDigits,
    formatNumberData,
    toBase62,
    roundUpTwoDigitsV2,
    formatNumberDataV2
}