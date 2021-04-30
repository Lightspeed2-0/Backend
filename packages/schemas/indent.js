const mongoose = require('mongoose');
const { Schema } = mongoose;

const indentSchema =new Schema({
    ConsigneeId : String,
	TransporterId: String,
	Source : {
			Address : String,
			City : String,
			Pincode : String,
			State : String
		    },
	Destination : {
			Address : String,
			City : String,
			Pincode : String,
			State : String
		    },
	OrderDate: Date,
	Volume : Number,
	Weight : Number,
	Amount : Number,
	IsPaid : Boolean,
	PaymentId : String,
	Status : Number,
	IsLTL : Boolean
});

const requestSchema = new Schema({
    ConsigneeId: String,
	TransporterId: String,
	IndentId: String,
	TransporterAccept: Boolean,
	ConsigneeAccept: Boolean,
	Amount: Number	
})
module.exports = {indentSchema,requestSchema};