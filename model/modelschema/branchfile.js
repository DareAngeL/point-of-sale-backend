const {DataTypes} = require('sequelize');
const { BaseModel } = require('..');

function defineBranchFile (sequelize){

    const cardType = sequelize.define("copy_branchfile",
    {
        recid : {
            type : DataTypes.BIGINT(20),
            allowNull : false,
            primaryKey : true,
            autoIncrement : true
        },
        brhcde : {
            type : DataTypes.STRING(40),
            allowNull : true,
        },
        brhdsc: {
            type : DataTypes.STRING(100),
            allowNull : true,
        }
    },
    {
        tableName : "copy_branchfile",
        timestamps : false
    })

    const initializeRelations = () =>{
        
    }

    const instance = new BaseModel(cardType);
    return {instance, initializeRelations};
}

module.exports = {defineBranchFile : defineBranchFile}