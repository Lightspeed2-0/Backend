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
    PanCardNo: String,
    PanVerified: Boolean,
    TinVerified: Boolean,
    IsVerified: Boolean,
    Rejected: String,
    OTP: Number,
    Role: Number
},{
  timestamps:true
});

const DriverSchema = new Schema({
  Username : String,
  Email : String,
  MobileNo : Number,
  DrivingLicense : String,
  Password : String,
  Rating : Number,
  TransporterId: String,
  TransporterName : String,
},{
  timestamps:true
});
module.exports = {TransporterSchema,DriverSchema};
