const {consignee_login} = require('./consignee')
const {transporterModel,driverModel} = require('./transporter');
const {adminModel} = require('./admin');
const {indentModel,requestModel, bidModel} = require('./indent');
module.exports = {
    consignee_login,
    transporterModel,
    adminModel,
    indentModel,
    requestModel,
    bidModel,
    driverModel
}