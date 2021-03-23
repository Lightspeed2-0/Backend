const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	consigneeLoginSchema
	}=require('../packages/schemas/index');

class consigneeLogin extends Model {
}
const consignee_login=mongoose.model(consigneeLogin,consigneeLoginSchema,'consignee');
module.exports={
    consignee_login
	};


// const mongoose = require('mongoose');


// const { eProofOfDeliverySchema } = require('../../packages/schemas/index');

// class eProofOfDelivery extends Model {
// }
// module.exports = mongoose.model(eProofOfDelivery, eProofOfDeliverySchema, 'epod');
    