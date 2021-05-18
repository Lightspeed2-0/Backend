const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema =new Schema({
    TransporterId: String,
	DriverId: String,
	Indents : [ {
	    IndentId:String,
    }],
    Status: Number,
    OrderDate: Date,
    Source : {
        City : String,
        Pincode : String
        },
    Destination : {
        City : String,
        Pincode : String
        },
},{
    timestamps:true
  });
module.exports = { OrderSchema };
