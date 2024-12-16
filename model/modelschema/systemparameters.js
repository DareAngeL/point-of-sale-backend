const {DataTypes} = require("sequelize");
const {BaseModel} = require("..");

function defineSystemParameters(sequelize) {
  const systemParameters = sequelize.define(
    "syspar",
    {
      recid: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      multibranch: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
      },
      multiwar: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      service_charge: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "0",
      },
      rddocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "RD-0000000000000",
      },
      rsdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "RS-0000000000000",
      },
      tidocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "TI-0000000000000",
      },
      todocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "TO-0000000000000",
      },
      wsdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "WS-0000000000000",
      },
      pcdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "PC-0000000000000",
      },
      ordocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "OR-0000000000000001",
      },
      posdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "POS-0000000000000001",
      },
      seqnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "SEQ-0000000000000000",
      },
      voidnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "VOID-0000000000000001",
      },
      billnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "BILL-0000000000000001",
      },
      background_color: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "#FFFFFF",
      },
      localtax: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "0",
      },
      ftp: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      sm: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      megaworld: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      robinson: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      ayala: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      ayala_mall_2022: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      ftphost: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      ftpuser: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      ftppword: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "",
      },
      ftpport: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
      },
      vatrte: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 12,
      },
      pathfile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      datestart: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      orderprintcount: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "1",
      },
      timeend: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: "05:59:59",
      },
      timestart: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: "06:00:00",
      },
      mw_fetchhrcde: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
      },
      takeout_scharge: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: false,
        defaultValue: "0",
      },
      dinein_scharge: {
        type: DataTypes.DECIMAL(18, 5),
        allowNull: false,
        defaultValue: "0",
      },
      ticket_bysubclass: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      enable_default_ticket_bysubclass: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "1",
      },
      allow_carryover: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      allow_printerstation: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      itemphoto_able: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      billdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "BLN-0000000000001",
      },
      ordercde: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "ORD-0000000000001",
      },
      otc: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      naia: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      ortigas: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      internal_param_inventory: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      internal_param_customer: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      cusdocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "CUS-0000000000001",
      },
      orderdeldocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "DEL-0000000000001",
      },
      itmclanum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "CLA-00001",
      },
      itmsubclanum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "SCLA-00001",
      },
      memcnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "MEMC-00001",
      },
      locnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "LOC-00001",
      },
      withtracc: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      internal_param_selfservice: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      selfservice_zread_time: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      selfservice_firstzread_trncount: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      activateautotransfer: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "0",
      },
      transferinterval: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "5",
      },
      serverprotocol: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      serversite: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      serveripaddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      serverport: {
        type: DataTypes.INTEGER(20),
        allowNull: true,
      },
      trnsfrmod: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      is_transferring: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      bypass_trnlock: {
        type: DataTypes.INTEGER(1),
        allowNull: true,
        defaultValue: "0",
      },
      no_dineout: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_itm_remove: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      send_to_kitchen: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      sticker_printer: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      accpac: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      pending_checklist: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      ej_pathfile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      allow_otherlanguage: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      swipe_auth: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_cancel_tran: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      email_report: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_void_tran: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_reprintvoid_tran: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_reprint_tran: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_recall_tran: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_add_disc: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_free_itm: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_free_tran: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_report: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      dbbackup_pathfile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bypass_hookup_resend: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      dinetypenum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "DNT-00000000001",
      },
      warehousenum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "TNT-00000000001",
      },
      pricelistnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "PRCL-00000000001",
      },
      cusnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "CUS-00000000001",
      },
      manual_dinetype: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      auth_prc_change: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      sync_last_update: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      optimized: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      consolidated_pathfile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      sticker_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      multitrmnal: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      serverhost: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      serverusername: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      serverpassword: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      serverfileport: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      itmcdedocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "ITM-0000000000001",
      },
      refnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: "REF-0000000000000001",
      },
      recontime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      pos_type: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: "",
      },
      sm_saltyp: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      sm_mall_2022: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      sta_lucia: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      nexbridge: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      receipt_itmnum: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      cmaster_pathfile: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      shangrila: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      nexbrigde_path: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      central_lastcon: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      onetime_prcload: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      enablerefund: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        defaultValue: "0",
      },
      sftp_robinson: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      robinson_operation_set: {
        type: DataTypes.INTEGER(2),
        allowNull: false,
        defaultValue: "12",
      },
      transferlimit: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: "400",
      },
      viewsentfiles: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      enable_separate_hookup: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      mitsukoshi: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      api_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      api_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      secret_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      request_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      contract_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      generate_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      pos_no: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      combodocnum: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      comp_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mitsukoshi_setup_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      trnsfrdte_start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      itemclass_printer_station_tag: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "1",
      },
      itemsubclass_printer_station_tag: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      prntr_stn_tag_modified: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      enable_spcl_req_receipt: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      receipt_title: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      timeformat: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
      timeextension: {
        type: DataTypes.TIME,
        allowNull: true,
        defaultValue: "00:00:00",
      },
      isextended: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: "0",
      },
      timeinterval: {
        type: DataTypes.INTEGER,
        defaultValue: "30",
      },
      active_mall: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
        defaultValue: "0",
      },
    },
    {
      tableName: "syspar",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["recid"],
        },
      ],
    }
  );

  const initializeRelations = () => {};

  const instance = new BaseModel(systemParameters);
  return {systemParameters, instance, initializeRelations};
}

module.exports = {defineSystemParameters: defineSystemParameters};
