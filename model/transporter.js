const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	TransporterSchema
	}=require('../packages/schemas/index');

class transporter extends Model {
}
const transporterModel=mongoose.model(transporter,TransporterSchema,'transporter');
module.exports={
    transporterModel
	};
