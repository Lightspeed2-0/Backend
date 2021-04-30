const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	indentSchema,
    requestSchema
	}=require('../packages/schemas/index');

class indent extends Model {
}
class  request extends Model {
}

const indentModel=mongoose.model(indent,indentSchema,'indent');
const requestModel=mongoose.model(request,requestSchema,'request');
module.exports={
    indentModel,
    requestModel
};
