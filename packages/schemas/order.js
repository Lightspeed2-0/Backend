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
        Pincode : String,
        Geolocation :{}
        },
    Destination : {
        City : String,
        Pincode : String,
        Geolocation :{}
        },
    TotalVolume : Number,
    TotalWeight : Number,
    RemWeight : Number,
    RemVolume : Number,
    VehicleNo : String,
    IsLTL : Boolean
},{
    timestamps:true
  });
module.exports = { OrderSchema };
