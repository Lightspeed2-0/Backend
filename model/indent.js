const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	indentSchema,
    requestSchema,
    bidSchema,
    QuotationSchema
	}=require('../packages/schemas/index');

class indent extends Model {
}
class  request extends Model {
}
class  bid extends Model {
}
class quotation extends Model{
}
const indentModel=mongoose.model(indent,indentSchema,'indent');
const requestModel=mongoose.model(request,requestSchema,'request');
const bidModel=mongoose.model(bid,bidSchema,'bids');
const quotationModel=mongoose.model(quotation,QuotationSchema,'quotations');

module.exports={
    indentModel,
    requestModel,
    bidModel,
    quotationModel
};
