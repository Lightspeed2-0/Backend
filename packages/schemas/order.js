const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema =new Schema({
    TransporterId: String,
	DriverId: String,
	Indents : [ {
	    IndentId:String,
    }]

},{
    timestamps:true
  });
module.exports = { OrderSchema };
