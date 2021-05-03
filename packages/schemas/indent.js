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
},{
	timestamps:true
  });

const requestSchema = new Schema({
    ConsigneeId: String,
	TransporterId: String,
	IndentId: String,
	TransporterDeleted: Boolean,
	ConsigneeDeleted: Boolean,
	Amount: Number,
	Status: Number	
},{
	timestamps:true
  })

const bidSchema = new Schema({
	ConsigneeId:String,
	IndentId: String,
	BidStatus: String,
	NoOfBids:Number,
	Bids:[{
		TransporterId:String,
		Username: String,
		Amount:Number
	}],
	Amount: Number
},{
	timestamps:true
  })
module.exports = {indentSchema,requestSchema,bidSchema};