const express = require("express");
const router = express.Router();
const { modelList } = require("../model/model");
const seccodeEnums = require("../enums/securitycode-enum");
const company = require("../helper/_Decrypt");
const seccde = require("../helper/_securitycode");
const { format, differenceInDays } = require("date-fns");
const clientpath = require("../encrypt/client.json");
const headerfile = require("../model/modelschema/headerfile");

module.exports = securityCodeEndPoints = () => {
  const client = clientpath.list.find((x) => x.name === clientpath.active);
  const client_code = client ? client.code : clientpath.list[0].code;

  const header = modelList.headerfile.instance.GetInstance();
  const companyfile = modelList.company.instance.GetInstance();

  router.post("/", async (req, res) => {
    const dateNow = format(new Date(), "MM/dd/yyyy hh:mm:ss a");

    try {
      if (req.body.createposfile) {
        const response = {
          encrypted: "",
        };
        response.encrypted = seccde.encryptData(
          seccde.formatData({
            serialno: `${client_code}-000000`, //"829-000000",
            expdte: dateNow,
            lastuse: dateNow,
          })
        );

        res.send(response);
      } else {
        const ischeck = req.body.ischeck;
        const serialno = seccde.getSerial(req.body.imei);
        const _comfile = company.DecryptCom(seccodeEnums.OPTIONS.COMPATH);
        
        const _posfile = seccde.parseData(
          seccde.decryptData(req.body.lstpos)
        );
        const response = {
          incorrect: false,
          expired: false,
          override: false,
          missing: false,
          expiring: false,
          serial: false,
          invalidcode: false,
          company: {},
          pos: {},
          expiringDays: 0,
          message: "",
          reqister: false,
          warningcode1: "",
          expringdate: "",
          encrypted: "",
        };
        
        const findCompany = await companyfile.findOne({
          where: {
            recid: 1,
          }
        })

        const findHeader = await header.findOne({});

        await findCompany.update({comcde: _comfile[1], comdsc: _comfile[0]});
        await findHeader.update({business1: _comfile[0], taxpayer: _comfile[0]});

        response.company["company_no"] = _comfile[1];
        response.pos["serialno"] = serialno;

        const lastuse = format(
          new Date(_posfile.lastuse),
          "MM/dd/yyyy hh:mm:ss a"
        );
        const expdte = format(
          new Date(_posfile.expdte),
          "MM/dd/yyyy hh:mm:ss a"
        );
        const expyear = new Date(expdte).getFullYear().toString().substr(-2);

        response.warningcode1 = `${[
          format(new Date(expdte), "MM"),
          "001",
          format(new Date(expdte), "dd"),
          "001",
          expyear,
        ].join("-")}`;

        if (ischeck) {
          if (serialno !== _posfile.serialno) {
            response.serial = true;
          }

          if (
            format(new Date(lastuse), "yyyy-MM-dd") >
            format(new Date(dateNow), "yyyy-MM-dd")
          ) {
            response.override = true; //BACK DATE
          }

          if (
            format(new Date(expdte), "yyyy-MM-dd") ===
              format(new Date(dateNow), "yyyy-MM-dd") ||
            format(new Date(expdte), "yyyy-MM-dd") <
              format(new Date(dateNow), "yyyy-MM-dd")
          ) {
            response.expired = true; //SUBSCRIPTION EXPIRED
          }

          if (
            !response.missing &&
            !response.override &&
            !response.expired &&
            !response.serial &&
            !response.incorrect
          ) {
            const expringDays = differenceInDays(
              new Date(expdte),
              new Date(dateNow)
            );
            if (expringDays <= 30) {
              response.expiring = true;
            }

            response.warningcode1 = `${[
              format(new Date(expdte), "MM"),
              "001",
              format(new Date(expdte), "dd"),
              "001",
              expyear,
            ].join("-")}`;

            response.expringdate = format(new Date(expdte), "MM/dd/yyyy");
            response.passed = true;

            await modelList.company.instance.GetInstance().update(
              {
                comcde: _comfile[0],
                comdsc: _comfile[0],
              },
              {
                where: {
                  recid: 1,
                },
              }
            );
            await modelList.headerfile.instance.GetInstance().update(
              {
                taxpayer: _comfile[0],
              },
              {
                where: {
                  recid: 1,
                },
              }
            );
          } else {
            let expyear1 = new Date(dateNow)
              .getFullYear()
              .toString()
              .substr(-2);

            response.warningcode1 = `${[
              format(new Date(dateNow), "MM"),
              "001",
              format(new Date(dateNow), "dd"),
              "001",
              expyear1,
            ].join("-")}`;

            response.encrypted = seccde.encryptData(
              seccde.formatData({
                serialno: serialno,
                expdte: dateNow,
                lastuse: dateNow,
              })
            );
          }
        } else {
          const _seccde = req.body.seccde;
          let securitycde = company.js_decrypt(_seccde);
          let seccde_expiry = securitycde.substr(0, 6);
          let seccde_serialno = securitycde.substr(12, 9);
          seccde_serialno =
            seccde_serialno.substr(0, 3) + "-" + seccde_serialno.substr(3, 6);
          seccde_expiry = seccde_expiry.match(/.{1,2}/g).join("-");
          const _expdte = format(
            new Date(seccde_expiry),
            "MM/dd/yyyy hh:mm:ss a"
          );

          if (
            serialno !== seccde_serialno ||
            format(new Date(_expdte), "yyyy-MM-dd") <
              format(new Date(dateNow), "yyyy-MM-dd")
          ) {
            response.invalidcode = true;
            response.message = "Invalid Security Code";
          } else {
            response.encrypted = seccde.encryptData(
              seccde.formatData({
                serialno: serialno,
                expdte: _expdte,
                lastuse: dateNow,
              })
            );
            response.reqister = true;
            response.invalidcode = false;
            response.message = "Registered!";
            response.passed = true;
            response.company["company_code"] = _comfile[0];
          }
        }
        res.send(response);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

  return router;
};
