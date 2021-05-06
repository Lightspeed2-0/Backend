const {consigneeLoginSchema} = require('./consignee');
const {TransporterSchema,DriverSchema} = require('./transporter');
const {AdminSchema} = require('./admin');
const {indentSchema,requestSchema,bidSchema} = require('./indent');
const {OrderSchema} = require('./order');
const {ContactFormSchema} =require('./general');
module.exports = {
    consigneeLoginSchema,
    AdminSchema,
    TransporterSchema,
    indentSchema,
    requestSchema,
    bidSchema,
    DriverSchema,
    OrderSchema,
    ContactFormSchema
}