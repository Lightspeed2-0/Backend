const mongoose = require('mongoose');
const { Schema } = mongoose;

const consigneeLoginSchema =new Schema({
    Username: String,
    Email: String,
    MobileNo: Number,
    Rating: Number,
    Password: String,
    IsVerified: Boolean,
    PanVerified: Boolean,
    PanCardNo: String,
    PanCard: String,
    OTP: Number,
    Role:Number
    });
module.exports = {consigneeLoginSchema};
