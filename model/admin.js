const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	AdminSchema
	}=require('../packages/schemas/index');

class admin extends Model {
}
const adminModel=mongoose.model(admin,AdminSchema,'admin');
module.exports={
    adminModel
};
