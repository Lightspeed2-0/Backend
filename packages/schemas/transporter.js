const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransporterSchema =new Schema({
    Username: String,
	Email: String,
    MobileNo: Number,
    PanCard: String,
  	TinCard: String,
    Rating: Number,
    Password: String,
    PanVerified: Boolean,
    TinVerified: Boolean,
    IsVerified: Boolean,
    Rejected: String,
    OTP: Number,
    Role: Number
});
module.exports = {TransporterSchema};
