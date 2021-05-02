const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	indentSchema,
    requestSchema,
    bidSchema
	}=require('../packages/schemas/index');

class indent extends Model {
}
class  request extends Model {
}
class  bid extends Model {
}

const indentModel=mongoose.model(indent,indentSchema,'indent');
const requestModel=mongoose.model(request,requestSchema,'request');
const bidModel=mongoose.model(bid,bidSchema,'bids');

module.exports={
    indentModel,
    requestModel,
    bidModel
};
