const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactFormSchema =new Schema({
    Email:String,
    Name:String,
    Message:String
},{
    timestamps:true
  });
module.exports = {ContactFormSchema};
