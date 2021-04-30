const {consigneeLoginSchema} = require('./consignee');
const {TransporterSchema} = require('./transporter');
const {AdminSchema} = require('./admin');
const {indentSchema,requestSchema} = require('./indent')
module.exports = {
    consigneeLoginSchema,
    AdminSchema,
    TransporterSchema,
    indentSchema,
    requestSchema
}