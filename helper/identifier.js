const os = require('os');
const crypto = require('crypto');
const { toBase62 } = require('./stringHelper');


async function generateSecurityCode() {

    const networkInterfaces = os.networkInterfaces();
    let macAddress = null;

    for (const interfaceDetails of Object.values(networkInterfaces)) {
        for (const detail of interfaceDetails) {
            if (!detail.internal && detail.mac && detail.mac !== '00:00:00:00:00:00') {
                macAddress = detail.mac;
                break;
            }
        }
        if (macAddress) break;
    }

    if (!macAddress) {
        throw new Error("No external network interfaces found.");
    }

    // Generate a hash using the MAC address
    const hash = crypto.createHash('sha256').update(macAddress).digest();

    // Convert the hash to base62
    const base62ID = toBase62(hash);

    // Take the first 6 characters
    const uniqueID = base62ID.substring(0, 6);

    return uniqueID;
}

module.exports = {
    generateSecurityCode
}