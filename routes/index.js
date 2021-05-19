const express = require('express');
const { route } = require('./consignee');
const consignee = require('./consignee');
const transporter = require('./transporter');
const tester = require('./tester');
const admin = require('./admin');
const driver = require('./driver')
const {contactFormModel} = require('../model/index');
const request = require('request')
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

router.post("/geoLocation",async(req,res)=>{
    var body = req.body;
    var getRoute = new Promise(function(resolve, reject) {
        let options = {
            method: "GET",
            url: `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf624841b747b534394a73b8283ad3de48ff61&start=${body.Source.lng},${body.Source.lat}&end=${body.Destination.lng},${body.Destination.lat}`,
            headers: {
              Accept:
                "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
            },
          }
      request.get(options, function(err, resp, body) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body));
        }
      })
    });
    await getRoute.then(Routes=>{
        if(Routes.error == undefined)
        {
            res.send({coordinates:Routes.features[0].geometry.coordinates});
        }
        else{
            var data = [[body.Source.lng,body.Source.lat],[body.Destination.lng,body.Destination.lat]];
            res.send({coordinates:data})
        }
    }).catch(err=>{
        console.log(err);
        var data = [[body.Source.lng,body.Source.lat],[body.Destination.lng,body.Destination.lat]];
        res.send({coordinates:data})
    })
})
module.exports = router;