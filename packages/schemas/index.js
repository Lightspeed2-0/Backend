const {consigneeLoginSchema} = require('./consignee');
const {TransporterSchema,DriverSchema} = require('./transporter');
const {AdminSchema} = require('./admin');
const {indentSchema,requestSchema,bidSchema} = require('./indent')
module.exports = {
    consigneeLoginSchema,
    AdminSchema,
    TransporterSchema,
    indentSchema,
    requestSchema,
    bidSchema,
    DriverSchema
}