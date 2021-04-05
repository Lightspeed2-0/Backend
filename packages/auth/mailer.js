var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'lightningspeed.2021@gmail.com',
           pass: 'C&IProject'
       }
   });
module.exports = transporter;