const {consigneeLoginSchema} = require('./consignee');
const {TransporterSchema,DriverSchema} = require('./transporter');
const {AdminSchema} = require('./admin');
const {indentSchema,requestSchema,bidSchema} = require('./indent');
const {OrderSchema} = require('./order');
module.exports = {
    consigneeLoginSchema,
    AdminSchema,
    TransporterSchema,
    indentSchema,
    requestSchema,
    bidSchema,
    DriverSchema,
    OrderSchema
}