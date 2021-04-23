const {consigneeLoginSchema} = require('./consignee');
const {TransporterSchema} = require('./transporter');
const {AdminSchema} = require('./admin');

module.exports = {
    consigneeLoginSchema,
    AdminSchema,
    TransporterSchema
}