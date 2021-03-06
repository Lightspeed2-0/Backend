const mongoose = require('mongoose');
const { Schema } = mongoose;

const indentSchema =new Schema({
    ConsigneeId : String,
	TransporterId: String,
	OrderId: String,
	Source : {
			Address : String,
			City : String,
			Pincode : String,
			State : String,
			Geolocation :{}
		    },
	Destination : {
			Address : String,
			City : String,
			Pincode : String,
			State : String,
			Geolocation :{}
		    },
	OrderDate: Date,
	Volume : Number,
	Weight : Number,
	Amount : Number,
	IsPaid : Boolean,
	PaymentId : String,
	Status : Number,
	StatusStack : [{Date:String ,Time : String}],
	IsLTL : Boolean
},{
	timestamps:true
  });
const request = {
    ConsigneeId: String,
	TransporterId: String,
	IndentId: String,
	TransporterDeleted: Boolean,
	ConsigneeDeleted: Boolean,
	Amount: Number,
	Status: Number	
}
const requestSchema = new Schema({...request},{
	timestamps:true
  })
const poolingRequestSchema = new Schema({...request,
	OrderId:String},{
		timestamps:true
	  })
const bidSchema = new Schema({
	ConsigneeId:String,
	IndentId: String,
	BidStatus: Number,
	NoOfBids:Number,
	Bids:[{
		QuotationId:String,
	}],
	Amount: Number
},{
	timestamps:true
  })

const QuotationSchema = new Schema({
	BidId:String,
	TransporterId:String,
	Amount: Number,
},{
	timestamps:true
})
module.exports = {poolingRequestSchema,indentSchema,requestSchema,bidSchema,QuotationSchema};