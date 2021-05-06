const mongoose=require('mongoose');
const { Model } = mongoose;
const {
	ContactFormSchema
	}=require('../packages/schemas/index');

class contactForm extends Model {
}
const contactFormModel=mongoose.model(contactForm,ContactFormSchema,'contactForm');
module.exports={
    contactFormModel
};
