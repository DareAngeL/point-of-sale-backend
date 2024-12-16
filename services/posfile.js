
const {modelList} = require("../model/model");
const {v4: uuidv4} = require("uuid");
const { round2decimal } = require("../helper/decimal");
const { computeTotal } = require("../model/posfile/compute_total");


console.log("Model List", modelList);
const posfile = modelList.posorderingfile.instance;
const pos = modelList.posorderingfile.instance.GetInstance();
const header = modelList.headerfile.instance.GetInstance();
const syspar = modelList.systemparameters.instance.GetInstance();

const getAllPrevious = async (ordocnum) => {

    const findAllPOS = await pos.findAll({where: {
        ordocnum: ordocnum
    }});

    return findAllPOS;
}

const generateTransaction = async (req, res) => {

        const findHeader = await header.findOne({});
        
        let find = [];
        const request = req.body;
        const {recid} = request;
    
        const findSyspar = await syspar.findOne({});
        const count = await pos.count({where: {ordercde: request.ordercde}});
    
        let netvatamt = 0;
        let vatamt = 0;
        let vatexempt = 0;
    
        // console.log("TIGNAN Q LANG",request);
    
        if (request.taxcde == "VATABLE") {
          netvatamt =
            ((request.untprc * 1) * (request.itmqty * 1)) / (1 + findSyspar.vatrte / 100);
          // vatamt = (request.untprc * request.itmqty) * (1 - 1 /(1+findSyspar[0].vatrte/100))
          // vatamt =
          //   (request.untprc*1) *
          //   (request.itmqty*1) *
          //   (1 - 1 / (1 + findSyspar.vatrte / 100));
            vatamt = (request.untprc * request.itmqty) - netvatamt;
    
            console.log(vatamt, netvatamt, "LEGIT?");
        } else if (request.taxcde == "VAT EXEMPT") {
          vatexempt = request.untprc * request.itmqty;
        }
    
        let serviceCharge = 0;
    
        if (request.ordertyp == "DINEIN") {
          serviceCharge =
            (vatexempt != 0 ? vatexempt : netvatamt) *
            (findSyspar.dinein_scharge / 100);
        } else {
          serviceCharge =
            (vatexempt != 0 ? vatexempt : netvatamt) *
            (findSyspar.takeout_scharge / 100);
        }
    
    
        const updatedRequest = {
          ...request,
          orderitmid: uuidv4(),
          grossprc: round2decimal(request.untprc),
          untprc: round2decimal(request.untprc),
          groprc: round2decimal(request.untprc),
          extprc: round2decimal(request.untprc),
          groext: round2decimal(request.untprc),
          netvatamt: round2decimal(netvatamt),
          vatamt: round2decimal(vatamt),
          vatexempt: round2decimal(vatexempt),
          scharge: round2decimal(serviceCharge),
          trncde: "POS",
          warcde: findHeader.warcde,
          postrmno: findHeader.postrmno
    
    
          // orderitmid: uuidv4(),
          // grossprc: request.untprc,
          // untprc: request.untprc,
          // groprc: request.untprc,
          // extprc: request.untprc,
          // groext: request.untprc,
          // netvatamt: netvatamt,
          // vatamt: vatamt,
          // vatexempt: vatexempt,
          // scharge: serviceCharge,f
          // trncde: "POS",
        };
    
        // console.log("updated to par", updatedRequest);
    
        const templateObject = {
          ordercde: request.ordercde,
          brhcde: request.brhcde ?? "",
          itmcde: "",
          itmqty: 1,
          voidqty: 0,
          grossprc: 0,
          groprc: 0,
          untprc: 0,
          vatrte: 0,
          ordertyp: request.ordertyp,
          memc: request.memc,
          memc_value: request.memc_value,
          taxcde: null,
          itmpaxcount: request.itmpaxcount,
          isaddon: false,
          mainitmcde: request.itmcde,
          postypcde: request.postypcde,
          warcde: findHeader.warcde,
          docnum: request.docnum,
          billdocnum: request.billdocnum,
          trndte: request.trndte,
          logtim: request.logtim,
          cashier: request.cashier || "sampleUser",
          numpax: 1,
          postrmno: findHeader.postrmno,
          bnkcde: request.bnkcde,
          itmnum: request.itmnum,
          trncde: "POS",
        };
    
        if (count <= 0) {
          const array = [
            {
              ...templateObject,
              itmcde: "TOTAL",
              postrntyp: "TOTAL",
              itmqty: 0,
              groext: round2decimal(request.groext),
              extprc: round2decimal(request.extprc),
              untprc: round2decimal(request.untprc),
              groprc: round2decimal(request.groprc),
              // groext: request.groext,
              // extprc: request.extprc,
              // untprc: request.untprc,
              // groprc: request.groprc,
              // ordocnum: findSyspar.ordocnum,
            },
            {
              ...templateObject,
              itmcde: "SERVICE CHARGE",
              postrntyp: "SERVICE CHARGE",
              itmqty: 1,
            },
            {
              ...templateObject,
              itmcde: "VATEXEMPT",
              postrntyp: "VATEXEMPT",
              itmqty: 1,
            },
            {
              ...templateObject,
              itmcde: "LOCALTAX",
              postrntyp: "LOCALTAX",
              itmqty: 1,
            },
            {
              ...templateObject,
              itmcde: "VAT 0 RATED",
              postrntyp: "VAT 0 RATED",
              itmqty: 1,
            },
            {
              ...templateObject,
              itmcde: "DISCOUNTABLE",
              postrntyp: "DISCOUNTABLE",
              itmqty: 1,
            },
            {
              ...templateObject,
              itmcde: "Less Vat Adj.",
              postrntyp: "Less Vat Adj.",
              itmqty: 1,
            },
            updatedRequest,
          ];
    
          // console.log("Dito nag eerror", array);
    
          find = await pos.bulkCreate(array);
        } else {
          find = await posfile.CreateOrUpdate({recid: recid}, updatedRequest);
        }
    
        try {
          await computeTotal(pos, {
            postrntyp: "ITEM",
            ordercde: request.ordercde,
            // itmcomtyp: null,
          });
        } catch (e) {
          console.error(e);
        }
    
        res.status(200).json(find);
      }

module.exports = {
    getAllPrevious,
    generateTransaction
}