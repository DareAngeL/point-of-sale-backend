const { getSequelize } = require("../database");
const { modelList } = require("../model/model");

const checkDBStructure = async (wsConnection) => {
    const qInterface = getSequelize().getQueryInterface();
    const nonExistingColumns = [];
    for (const key in modelList) {
        const _model = modelList[key].instance.GetInstance();
        const tableDefinition = await qInterface.describeTable(_model.tableName); // Describes the table structure (columns and types)
        cols = Object.values(_model.rawAttributes)
            .map(value => {
            return {
                objtype: value.type,
                fieldName: value.fieldName
            }
            });

        cols.forEach((column) => {
            if (!tableDefinition[column.fieldName]) {
            console.log(`Column ${column.fieldName} at table '${_model.tableName}' does not exist.`);
            nonExistingColumns.push(column);
            }
        });
    }

    wsConnection.send(JSON.stringify({ data: nonExistingColumns, type: "DB Structure" }));
};

module.exports = {
  checkDBStructure,
}