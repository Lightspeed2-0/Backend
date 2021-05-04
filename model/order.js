const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	OrderSchema
	}=require('../packages/schemas/index');

class order extends Model {
}
const orderModel=mongoose.model(order,OrderSchema,'order');
module.exports={
    orderModel
};
