const CryptoJS = require("crypto-js");
const fs = require("fs");
const path = require("path");
const seccodeEnums = require("../enums/securitycode-enum");
const os = require("os");
const clientpath = require("../encrypt/client.json");

const client = clientpath.list.find((x) => x.name === clientpath.active);
const client_code = client ? client.code : clientpath.list[0].code;

const encryptData = (str) => {
  return CryptoJS.AES.encrypt(
    str,
    seccodeEnums.OPTIONS.ENCRYPTKEY.trim()
  ).toString();
};

const decryptData = (str) => {
  return CryptoJS.AES.decrypt(str, seccodeEnums.OPTIONS.ENCRYPTKEY.trim()).toString(
    CryptoJS.enc.Utf8
  );
};

const generateFile = (str, filename) => {
  return new Promise((resolve, reject) => {
    str = encryptData(str);
    fs.writeFile(path.resolve(filename), str, "utf8", (err, data) => {
      if (!err) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const getFileContent = (filename) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.resolve(filename))) {
      resolve(false);
    } else {
      fs.readFile(path.resolve(filename), (err, data) => {
        if (!err) {
          resolve(decryptData(data.toString()));
        } else {
          resolve(false);
        }
      });
    }
  });
};

const parseData = (str) => {
  let text = str.split(/\r\n|\r|\n/g);
  const arrData = {};
  const len = text.length;
  for (let i = 0; i < len; i++) {
    const detail = text[i].split(/\t/g);
    if (detail[0] && detail[1]) {
      arrData[detail[0]] = detail[1];
    }
  }
  return arrData;
};

const formatData = (object) => {
  let da = "";
  for (const key in object) {
    da += key;
    da += "\t";
    da += object[key];
    da += os.EOL;
  }
  return da;
};

const DecryptCOM = (seccde) => {
  var serialno = "";
  var compnum = "";
  var expdte = "";

  let arr_seccode = seccde.replace(/-/gi, "").split("");
  let xchar = "";
  var skip_compnum = false;
  var skip_serial = false;
  var skip_expdte = false;

  for (var i = arr_seccode.length - 1; i >= 0; i--) {
    xchar = arr_seccode[i];

    if (!skip_expdte) {
      if (expdte.length < 6) {
        expdte += xchar;
        skip_expdte = true;
        continue;
      } else {
        skip_serial = false;
      }
    }

    if (!skip_serial) {
      if (serialno.length < 9) {
        serialno += xchar;
        skip_serial = true;
        continue;
      }
    }

    if (!skip_compnum) {
      if (compnum.length < 6) {
        compnum += xchar;
      }
    }

    skip_compnum = false;
    skip_serial = false;
    skip_expdte = false;
  }

  let serialnum = serialno.substring(0, 9);
  serialnum = [serialnum.slice(0, 3), "-", serialnum.slice(3)].join("");

  let expiration = expdte.match(/.{1,2}/g).join("-");

  let arrData = [
    {
      serialno: ConvertToNumber(serialnum),
      expdte: ConvertToNumber(expiration),
      companyno: ConvertToNumber(compnum),
    },
  ];

  return arrData;
};

const ConvertToNumber = (str) => {
  let ret = str;

  ret = ret.replace(/A/g, "0");
  ret = ret.replace(/B/g, "1");
  ret = ret.replace(/C/g, "2");
  ret = ret.replace(/D/g, "3");
  ret = ret.replace(/E/g, "4");
  ret = ret.replace(/F/g, "5");
  ret = ret.replace(/G/g, "6");
  ret = ret.replace(/H/g, "7");
  ret = ret.replace(/I/g, "8");
  ret = ret.replace(/J/g, "9");

  return ret;
};

const getSerial = (str) => {
  const splitted = str.split("-");
  let _serial = splitted.join("");
  _serial = ConvertLetters(_serial);

  let newserial = "",
    str1 = "",
    serialno = "";
  for (let i = 0; i < _serial.length; i++) {
    str1 = _serial.charAt(i);

    if (str1 !== "0") {
      newserial += str1;
    }
  }

  newserial = newserial.substr(-6);

  let padzero = "";
  if (newserial.length !== 6) {
    for (let i = 0; i < 6 - newserial.length; i++) {
      padzero += "0";
    }
  }

  newserial = padzero + newserial;

  serialno = `${client_code}-` + newserial;

  return serialno;
};

function ConvertLetters(str) {
  var serialno = "";
  for (let i = 0; i < str.length; i++) {
    if (isNaN(str.charAt(i))) {
      let strasc = str.charAt(i).charCodeAt();
      let strasc1 = strasc.toString().substr(0, 1);
      serialno += strasc1;
    } else {
      serialno += str.charAt(i);
    }
  }

  return serialno;
}

module.exports = {
  encryptData: encryptData,
  decryptData: decryptData,
  getFileContent: getFileContent,
  generateFile: generateFile,
  parseData: parseData,
  formatData: formatData,
  DecryptCOM: DecryptCOM,
  getSerial: getSerial,
};
