const express = require('express');
const { route } = require('./consignee');
const consignee = require('./consignee');
const transporter = require('./transporter');
const tester = require('./tester');
const admin = require('./admin');
const driver = require('./driver')
const {contactFormModel} = require('../model/index');
const mailTransporter = require("../packages/auth/mailer");

const router = express.Router();
const {adminAuth} = require("../packages/middleware/adminauth");

router.use('/consignee/',consignee);
router.use('/transporter/',transporter);
router.use('/test',tester);
router.use('/admin',admin);
router.use("/driver",driver);

router.get('/contactForm',adminAuth,async(req,res)=>{
    contactFormModel.find({}).then(contacts=>{
        res.send({contacts});
    })
});
router.put('/contactForm',adminAuth,async(req,res)=>{
    const mailOptions = {
        from: 'lightningspeed.2021@gmail.com', // sender address
        to: req.body.Email, // list of receivers
        subject: 'LightSpeed Reply for your Query', // Subject line
        html: `<p>Thank you for reaching our Lightspeed</p><p>Your Query is:</p><p>${req.body.Message}</p><br><p>Our Reply : </p><p>${req.body.Reply}</p><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
    };
    mailTransporter.sendMail(mailOptions, function (err, info) {
        if(err)console.log(err);        
    })
    await contactFormModel.deleteMany({_id:req.body._id}).then(err=>{
        res.send({msg:"Replied"});
    });
});
router.post('/deleteContactForm',adminAuth,async(req,res)=>{
    contactFormModel.deleteMany({_id:req.body._id}).then(err=>{
        res.send({msg:"deleted"});
    });
});
router.post("/contactForm",async(req,res)=>{
    var contact = new contactFormModel({...req.body});
    await contact.save(err=>{
        if(err)
        {
            console.log(err);
        }
        res.send({msg:"success"});
    });
})
module.exports = router;