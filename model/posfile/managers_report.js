
const {modelList} = require("../model");
const {initDatabase} = require("../../database");
const {Op, literal} = require("sequelize");
const { format, startOfDay, endOfDay} = require('date-fns');
const freereason = require("../modelschema/freereason");
const dinetype = require("../modelschema/dinetype");
const orderitemdiscount = require("../modelschema/orderitemdiscount");
const { dateFormatter } = require("../../helper");

const sequelize = initDatabase();


const itemizedManagersReport = async (from, to, offset, limit) => {
    const pos = modelList.posfile.instance.GetInstance();
    const orderitemdiscount = modelList.orderitemdiscount.instance.GetInstance();

    //Itemized
    const itemizedAttributes = [
      "groext", "grossprc", "groprc", "disamt", "vatexempt", 
      "vatamt", "lessvat", "exemptvat", "recid", "docnum", 
      "itmcde", "itmqty", "trndte", "untprc", "extprc", "amtdis", 
      "netvatamt", 'orderitmid', 'scharge', 'refund', 'void', 
      'refundqty', 'ordocnum', 'chkcombo'
    ]
  
    //Other type of managers report
    const findAll = await pos.findAll(
      {
        where : 
        {
            trndte: {[Op.between]: [from, to]},
            [Op.or]: [
              { postrntyp: 'ITEM' }
            ],
            void: 0
        },
        order: [
          ["docnum", "ASC"]
        ],
        offset: offset,
        limit: limit,
        attributes: itemizedAttributes,
        include: [
          { 
            model: orderitemdiscount,
          }
        ],
      }
    );


    return findAll;
}

const dailyDineType = async (from, to, offset, limit) => {
    const pos = modelList.posfile.instance.GetInstance();
    const orderitemdiscount = modelList.orderitemdiscount.instance.GetInstance();

    //Itemized
    const dailyDineTypeAttribs = ["lessvat", "recid","itmcde", "itmqty", "untprc", "extprc", "amtdis", "ordertyp", 'groext', 'logtim', 'refundqty', 'itmqty', 'refund', 'ordocnum']
  
    //Other type of managers report
    const findAll = await pos.findAll(
      {
        where : 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "ITEM",
            void: 0
        },
        offset: offset,
        limit: limit,
        attributes: dailyDineTypeAttribs,
        include: [
          {
            model: orderitemdiscount
          }
        ]
      }
    )
    return findAll;
}

const voidTransactions = async (from, to, offset, limit) => {
    const pos = modelList.posfile.instance.GetInstance();

    //Itemized
    const voidAttribs = ["ordocnum", "logtim","groext", "extprc", "trndte", "voidreason"]
  
    //Other type of managers report
    const findAll = await pos.findAll(
      {
        where : 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "ITEM",
            void: 1
        },
        offset: offset,
        limit: limit,
        attributes: voidAttribs
      }
    )
    return findAll;
}

const refundByDate = async (from, to, offset, limit) => {
    const pos = modelList.posfile.instance.GetInstance();

    const refundAttribs = [
      'ordocnum', 'postrntyp' ,
      'itmcde', 'docnum', 
      'refund', 'trndte', 
      'logtim', 'refundlogtim', 
      'refunddte', 'extprc',
      'untprc','groext', 
      'vatamt', 'refundreason', 
      'refundqty', 'cashier',
      'scharge', 'scharge_disc'
    ];
  
    const findAll = await pos.findAll(
      {
        where : 
        {
            trndte: {[Op.between]: [from, to]},
            [Op.or]: [
              { postrntyp: 'PAYMENT' },
              { postrntyp: 'ITEM' }
            ],
            refund: 1,
            void: 0
        },
        offset: offset,
        limit: limit,
        attributes: refundAttribs
      }
    )
    return findAll;
}

const refundTransaction = async (from, to, offset, limit) => {
  const pos = modelList.posfile.instance.GetInstance();

  const refundAttribs = [
    'ordocnum', 'postrntyp' ,
    'itmcde', 'docnum', 
    'refund', 'trndte', 
    'logtim', 'refundlogtim', 
    'refunddte', 'extprc',
    'untprc','groext', 
    'vatamt', 'refundreason', 
    'refundqty', 'cashier', 
    'itmdsc', 'scharge', 
    'scharge_disc'
  ];

  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          postrntyp: "ITEM",
          refund: 1
      },
      offset: offset,
      limit: limit,
      attributes: refundAttribs
    }
  )
  return findAll;
}

const perDayHourly = async (from, to, offset, limit) => {

  const pos = modelList.posfile.instance.GetInstance();
  const orderitemdiscount = modelList.orderitemdiscount.instance.GetInstance();
  const perDayHourlyAttribs = ['ordocnum', 'recid', 'extprc', 'untprc' , 'groext', 'groprc', 'grossprc', 'govdisc', 'trndte', 'logtim', 'amtdis', 'lessvat', 'refundqty', 'itmcde', 'refund', 'itmqty', 'postrntyp'];
  
  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          [Op.or]: [
            { postrntyp: 'ITEM' },
            { postrntyp: 'TOTAL' },
          ],
          void: 0
      },
      order: [
        ["trndte", "ASC"],
        ["logtim", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: perDayHourlyAttribs,
      include: [
        { 
          model: orderitemdiscount,
        }
      ],
    }
  )
  return findAll;
}

const perOrderTaker = async (from, to, offset, limit) => {

  const pos = modelList.posfile.instance.GetInstance();
  const itemfile = modelList.item.instance.GetInstance();
  const perOrderTakerAttribs = [
    'trndte', 'logtim', 
    'ordertyp', 'itmcde', 
    'untprc', 'itmqty', 
    'extprc', 'ordocnum', 
    'refundqty', 'itmcde', 
    'refund', 'cashier',
    'itemfile.itmdsc'
  ];
  
  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          postrntyp: "ITEM",
          void: 0,
          orderitmid: {
            [Op.notIn]: literal(
              `(SELECT orderitmid FROM posfile WHERE postrntyp = 'ITEM' AND refund = 1 AND trndte BETWEEN '${dateFormatter(from)}' AND '${dateFormatter(to)}')`
            ),
          }
      },
      order: [
        ["trndte", "ASC"],
        ["logtim", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: perOrderTakerAttribs,
      include: {
        model: itemfile,
        attributes: ['itmdsc'],
        required: true
      }
    }
  )
  return findAll;
}

const eSales = async (from, to, offset, limit) => {

  const pos = modelList.posfile.instance.GetInstance();
  const orderitemdiscount = modelList.orderitemdiscount.instance.GetInstance();
  const eSalesAttribs = ['trndte', 'groext', 'lessvat', 'amtdis', 'govdisc', 'extprc', 'ordocnum', 'netvatamt', 'vatamt', 'vatexempt', 'refundqty', 'itmcde', 'itmqty', 'refund'];
  
  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          postrntyp: "ITEM",
          void: 0
      },
      order: [
        ["trndte", "ASC"],
        ["ordocnum", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: eSalesAttribs,
      include: [
        { 
          model: orderitemdiscount,
        }
      ],
    }
  )
  return findAll;
}

const salesSummary = async (from, to, offset, limit) => {

  const posfile = modelList.posfile.instance.GetInstance();
  const orderitemdiscount = modelList.orderitemdiscount.instance.GetInstance();
  const salesSummaryAttribs = ['trndte', 'groext', 'lessvat', 'amtdis', 'govdisc', 'extprc', 'ordocnum', 'netvatamt', 'vatamt', 'vatexempt', 'discde', 'logtim', 'postrntyp', 'batchnum', 'lessvat', 'void', 'untprc', 'refund', 'itmcde', 'taxcde'];
  

  const currentPosfile = await posfile.findAll({ 
      where: {
        trndte: {[Op.between]: [from, to]},
        [Op.or]: [
          { postrntyp: 'DISCOUNT' },
          { postrntyp: 'ITEM' },
          { postrntyp: 'SERVICE CHARGE'},
          { postrntyp: 'Less Vat Adj.'},
          { postrntyp: 'TOTAL'},
          { postrntyp: 'VAT 0 RATED' }, 
          { postrntyp: 'DISCOUNTABLE' },
          { postrntyp: 'PAYMENT' },
          { postrntyp: 'CASHFUND' },
          { postrntyp: 'CASHIN' },
          { postrntyp: 'NOTRANSACTION' },
          { postrntyp: 'CASHOUT' },
          { postrntyp: 'DECLARATION'},
          { itmcde: 'CHANGE'},
          { postrntyp: 'GRANDTOTAL'},
        ],
      },
      order: [
        ["trndte", "ASC"],
        ["ordocnum", "ASC"],
        ["logtim", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: salesSummaryAttribs,
      include: [
        { 
          model: orderitemdiscount,
        }
      ],
    },
  );
  return currentPosfile;

}

const dailySales = async (from, to, offset, limit) => {

  const pos = modelList.posfile.instance.GetInstance();
  const dailySalesAttribs = [
    'trndte', 'groext', 
    'lessvat', 'amtdis', 
    'govdisc', 'extprc', 
    'ordocnum', 'netvatamt', 
    'vatamt', 'vatexempt', 
    'discde', 'logtim', 
    'postrntyp', 'refund',
    'void', 'trncde',
    'billdocnum', 'itmqty',
    'itmcde', 'numpax', 'refund', 'refundqty',
  ];
  
  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          [Op.or]: [
            { postrntyp: 'DISCOUNT' },
            { postrntyp: 'ITEM' },
            { postrntyp: 'SERVICE CHARGE'},
            { postrntyp: 'Less Vat Adj.'},
            { postrntyp: 'TOTAL'},
            { postrntyp: 'VAT 0 RATED' },
            { postrntyp: 'PAYMENT' },
            { postrntyp: 'CASHFUND' },
            { postrntyp: 'CASHIN' },
            { postrntyp: 'CASHOUT' },
            { postrntyp: 'DECLARATION'},
            { itmcde: 'CHANGE'},
          ],
      },
      order: [
        ["trndte", "ASC"],
        ["ordocnum", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: dailySalesAttribs
    }
  );

  return findAll;
}

const freeTransaction = async (dinetypeList, from, to, offset, limit) => {
  
    const pos = modelList.posfile.instance.GetInstance();
    const pricedetail = modelList.pricedetail.instance.GetInstance();
    const dinetype = modelList["dinetype"].instance.GetInstance();

    const freeTransactionAttribs = [
      'trndte', 'freereason', 'ordocnum',
      'itmdsc', 'warcde', 'itmcde', 'itmqty', 'grossprc',
    ];

    const findAll = await pos.findAll(
      {
        where : 
        {
            trndte: {[Op.between]: [from, to]},
            postrntyp: "ITEM",
            ...(dinetypeList.length > 0 && { postypcde: {[Op.in]: dinetypeList} }),
            freereason: {
              [Op.not]: null
            },
        },
        order: [
          ["trndte", "ASC"],
          ["ordocnum", "ASC"]
        ],
        offset: offset,
        limit: limit,
        attributes: freeTransactionAttribs,
        ...(dinetypeList.length > 0 && { include: [dinetype] })
      }
    );

    return findAll;
  
}

const paymentType = async (from, to, offset, limit) => {

  const pos = modelList.posfile.instance.GetInstance();
  const salesSummaryAttribs = ['recid', 'trndte', 'postrntyp', 'itmcde', 'extprc', 'cashier', 'billdocnum', 'ordocnum', 'logtim', 'refundqty', 'ordocnum', 'itmqty', 'refund'];
  
  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          [Op.or]: [
            { postrntyp: 'PAYMENT' },
            { postrntyp: 'CHANGE' }
          ],
          void: 0
      },
      order: [
        ["trndte", "ASC"],
        ["ordocnum", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: salesSummaryAttribs
    }
  );
  
  return findAll;
}

const paymentByDinetype = async (dinetypeList, from, to, offset, limit) => {
  const pos = modelList.posfile.instance.GetInstance();
  const attribs = ['ordocnum', 'trndte', 'logtim', 'extprc', 'itmcde', 'postrmno', 'cashier'];
  const dinetype = modelList["dinetype"].instance.GetInstance();

  const findAll = await pos.findAll(
    {
      where : 
      {
          trndte: {[Op.between]: [from, to]},
          postrntyp: "PAYMENT",
          ...(dinetypeList.length > 0 && { postypcde: {[Op.in]: dinetypeList} }),
      },
      order: [
        ["trndte", "ASC"],
        ["ordocnum", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: attribs,
      ...(dinetypeList.length > 0 && { include: [dinetype] })
    }
  );

  return findAll;
}

const birReports = async (from, to, offset, limit) => {

  const pos = modelList.posfile.instance.GetInstance();
  const birAttribs = ['recid', 'trndte', 'postrntyp', 'itmcde', 'extprc', 'cashier', 'billdocnum', 'ordocnum', 'logtim', 'cardholder', 'cardno', 'tin', 'vatexempt', 'lessvat', 'vatamt', 'netvatamt', 'amtdis', 'groext'];
  
  const findAll = await pos.findAll(
    {
      where :   
      {
          trndte: {[Op.between]: [from, to]},
          [Op.or]: [
            { postrntyp: 'DISCOUNT' },
            { postrntyp: 'TOTAL' }
          ],
      },
      order: [
        ["trndte", "ASC"],
        ["ordocnum", "ASC"]
      ],
      offset: offset,
      limit: limit,
      attributes: birAttribs
    }
  );
  return findAll; 

}


module.exports = {paymentByDinetype: paymentByDinetype, freeTransaction: freeTransaction, itemizedManagersReport: itemizedManagersReport, dailyDineType: dailyDineType, voidTransactions: voidTransactions, refundByDate: refundByDate, refundTransaction: refundTransaction, perDayHourly: perDayHourly, perOrderTaker: perOrderTaker, eSales: eSales, salesSummary: salesSummary, paymentType: paymentType, dailySales: dailySales, birReports: birReports
}