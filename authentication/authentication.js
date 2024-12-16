
const { literal, Op } = require('sequelize');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const sanitize = require('./sanitizer');

//TEMPORARY
const config = require('../config/config.dev.json');

//SAMPLE : ec7117851c0e5dbaad4effdb7cd17c050cea88cb

const passwordEncrypt = (body) =>{
    
    const shasum = crypto.createHash('sha1');

    const paramUser = {
        usrcde : body.usrcde,
        usrpwd : shasum.update(body.usrpwd).digest("hex")
    };

    return paramUser;

}

const accountNumberEncrypt = (body) => {
  const shasum = crypto.createHash('sha1');

  if (!body.cardno) {
    return undefined;
  }

  const paramCardCreds = {
    cardholder: body.cardholder,
    cardno: shasum.update(body.cardno).digest("hex")
  }

  return paramCardCreds;
}

const login = async (body, model, useraccess, useraccessmenus) => {

    const posUserfile = model.GetInstance();
    let findUser;

    if (body.swipeCard) {
      const encryptedCard = accountNumberEncrypt(body.swipeCard);
      const sanitizedCardholder = sanitize(encryptedCard.cardholder);

      findUser = await posUserfile.findOne({where : {
        ...encryptedCard,
        cardholder: literal(`BINARY cardholder = '${sanitizedCardholder}'`)
      }, raw : true});

      if (!findUser) {
        return null;
      }

    } else {
      const encryptedPassword = passwordEncrypt(body);
      const sanitizedUsercode = sanitize(encryptedPassword.usrcde);

      findUser = await posUserfile.findOne({
        where : {
          ...encryptedPassword,
          usrcde: literal(`BINARY usrcde = '${sanitizedUsercode}'`)
        }, raw : true});

      if(!findUser)
          return null;
    }

    const useraccessfiles = await useraccess.findAll({where : {
      usrcde: findUser.usrcde,
      [Op.or]: [
        { usrcde: findUser.usrcde, allowadd: 1 },
        { usrcde: findUser.usrcde, allowdelete: 1 },
        { usrcde: findUser.usrcde, allowedit: 1 },
        { usrcde: findUser.usrcde, allowimport: 1 },
        { usrcde: findUser.usrcde, allowprint: 1 },
        { usrcde: findUser.usrcde, allowresend: 1 },
        { usrcde: findUser.usrcde, allowvoid: 1 }
      ]
    }, raw: true});
    const _useraccessmenus = await useraccessmenus.findAll({
      where: {
        menfield: useraccessfiles.map(a => a.menfield)
      },
      raw: true
    });

    const token = jwt.sign({
        usrname : findUser.usrname,
        usrcde : findUser.usrcde,
        usrlvl : findUser.usrlvl,
        usrtyp : findUser.usrtyp
    }, config.jwtsecret, {
        algorithm : 'HS256',
        expiresIn : '1d'
    });

    return {
        token : token,
        usrname : findUser.usrname,
        usrtyp : findUser.usrtyp,
        email : findUser.email,
        usrcde : findUser.usrcde,
        useraccessfiles : useraccessfiles.map(file => {
          const matchingData = _useraccessmenus.find(data => data.menfield === file.menfield);
          return {
            ...file,
            mencap: matchingData ? matchingData.mencap : undefined
          }
        })
    };
}

/**
 * Used for authorizing a transaction
 * @param {*} body 
 */
const loginAuthorized = async (body, model) => {
  const posUserfile = model.GetInstance();
  let findUser;

  if (body.swipeCard) {
    const encryptedCard = accountNumberEncrypt(body.swipeCard);
    encryptedCard.cardholder = literal(`BINARY cardholder = '${encryptedCard.cardholder}'`)
    findUser = await posUserfile.findOne({where : encryptedCard, raw : true});

    if(!findUser)
      return null;
  } else {
    const encryptedPassword = passwordEncrypt(body, true);
    findUser = await posUserfile.findOne({where : encryptedPassword, raw : true});

    if(!findUser)
      return null;
  }

  if (findUser.approver === 1) {
    return true;
  }

  return false;
}

const changePassword = async (body, model) =>{
  const { usrcde, oldpass, newpass } = body;
  const posUserfile = model.GetInstance();

  const encryptOldPass = passwordEncrypt({usrcde, usrpwd : oldpass});
  const encryptNewPass = passwordEncrypt({usrcde, usrpwd : newpass});
  const findUser = await posUserfile.findOne({where : encryptOldPass, raw : true});

  if (!findUser) return null;

  const update = await posUserfile.update({usrpwd : encryptNewPass.usrpwd}, {where : {usrcde : usrcde}});
  return update[0];
}

const verifyBearerToken = async (req, res, next) => {

    const {authorization} = req.headers;

    if(!authorization){
        res.status(401).json({status : "Unauthorized"})
        return;
    }

    const splitToken = authorization.split(" ")[1];


    try{
        const decodedToken = jwt.verify(splitToken, config.jwtsecret);
        req.user = decodedToken;

        next();
    }
    catch(e){
        console.error('Token verification failed', e);
        res.status(401).json({status : "Unauthorized"})
    }


}

module.exports = {login, loginAuthorized, changePassword, verifyBearerToken, passwordEncrypt, accountNumberEncrypt}