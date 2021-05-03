const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	TransporterSchema,
	DriverSchema
	}=require('../packages/schemas/index');

class transporter extends Model {
}
class driver extends Model {
}

const transporterModel=mongoose.model(transporter,TransporterSchema,'transporter');
const driverModel=mongoose.model(driver,DriverSchema,'driver');

module.exports={
    transporterModel,
	driverModel
	};
