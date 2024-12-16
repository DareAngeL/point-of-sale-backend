const { modelList } = require("../model/model")
const express = require('express');
const router = express.Router();
const crypto = require("crypto")

module.exports = companyEndpoints = () => {

    const company = modelList.company.instance;

    router.get("/", async (req, res) =>{
        const find = await company.Read();
        res.status(200).json(find);
    });

    router.put("/", async (req, res)=>{
        const {recid} = req.body;

        const update = await company.CreateOrUpdate({recid : recid}, req.body);
        res.status(200).json(update);

    });

    router.delete("/:id", async (req,res)=>{
        const {id} = req.params;

        const deleted = await company.Delete({recid : id});

        res.status(200).json(deleted);
    });

    router.post("/fuck", async (req, res) => {
        const ENC_KEY = 
            "4EE3252A258B269E037A6F4A1CD4D4F610AFA841BB311E994C6E00AD736E4924"

        const ENC_KEY_HALF = ENC_KEY.substring(0, 32);
    
        const flash_dec = (xstring) => {
            try {
                // Decode the base64 encoded string
                const c = Buffer.from(xstring, 'base64');
    
                // Get the IV length for AES-256-CBC
                const xvectorlen = 16; // IV length for AES-256-CBC is 16 bytes
    
                // Extract the IV from the beginning of the string
                const xvector = c.subarray(0, xvectorlen);
    
                // Extract the HMAC from the string (if needed for verification)
                const sha2len = 32;
                const hmac = c.subarray(xvectorlen, xvectorlen + sha2len);
    
                // Extract the ciphertext
                const xtextraw = c.subarray(xvectorlen + sha2len);
    
                // Decrypt the ciphertext
                const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY_HALF, xvector);

                let xdecvalue = decipher.update(xtextraw);
                xdecvalue = Buffer.concat([xdecvalue, decipher.final()]);
    
                return xdecvalue.toString('utf8');
            } catch (error) {
                console.error("Decryption error:", error.message);
                throw new Error("Decryption failed");
            }
        };
    
        try {
            const decrypted = flash_dec(
                "EURSRNxG0rBucObGYxGmU10tfAXteYDlbnFPhRF6bqzXDzaGMrrv5aZ3588IYP4LBK7s3MAUYtwVTOHebzwAghPMs/N19ZwtiycuVz0Ne/yeDYVo987ssl1alGjjQl6i"
            );
    
            res.status(200).json({
                fuck: decrypted
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    });

    return router;
}