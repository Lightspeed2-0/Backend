const mongoose = require('mongoose');
const { Schema } = mongoose;

const AdminSchema =new Schema({
    Username: String,
	Password: String,
    Role: Number
},{
    timestamps:true
  });
module.exports = {AdminSchema};
