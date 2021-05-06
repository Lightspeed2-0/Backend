const express = require('express');
const { route } = require('./consignee');
const consignee = require('./consignee');
const transporter = require('./transporter');
const tester = require('./tester');
const admin = require('./admin');
const driver = require('./driver')
const {contactFormModel} = require('../model/index');
const router = express.Router();

router.use('/consignee/',consignee);
router.use('/transporter/',transporter);
router.use('/test',tester);
router.use('/admin',admin);
router.use("/driver",driver);
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