const {consignee_login} = require('./consignee')
const {transporterModel,driverModel} = require('./transporter');
const {adminModel} = require('./admin');
const {indentModel,quotationModel,requestModel, bidModel,poolingRequestModel} = require('./indent');
const { orderModel } = require('./order');
const {contactFormModel} = require('./general');
module.exports = {
    consignee_login,
    transporterModel,
    adminModel,
    indentModel,
    requestModel,
    bidModel,
    driverModel,
    orderModel,
    contactFormModel,
    quotationModel,
    poolingRequestModel
}