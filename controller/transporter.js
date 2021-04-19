const mongoose = require("mongoose");
const { transporterModel } = require("../model/index");
const { JWTsign } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs')
const path = require('path');
const { fstat } = require("fs");

const OtpSender = async(Email,msg)=>{
    var OTP = Math.floor(Math.random()*(800000)+100000);
    await transporterModel.updateMany({Email:req.body.Email},{OTP:OTP});
    const mailOptions = {
        from: 'lightningspeed.2021@gmail.com', // sender address
        to: req.body.Email, // list of receivers
        subject: 'LightSpeed OTP verification', // Subject line
        html: `<p>Thank you for registering in our Lightspeed</p><p>OTP is:</p><h1>${OTP}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)console.log(err)
        else{
            res.status(401).send(msg+". New OTP send");
        }
        
    })
}
class Transporter{
    static async Login(req, res) {
        try {
          const body = req.body;
          transporterModel.findOne({ Email: body.Email }, (err, transporter) => {
            if (err) {
              console.log(err);
            }
            if (!transporter) {
              res.status(401).send({msg:"Invalid Email Id"});
            } 
            else if(transporter.Rejected!==""){
                res.status(403).send({msg:transporter.Rejected});
            }
            else if(transporter.IsVerified==false)
            {
                OtpSender(transporter.Email,"Email Not Verified");
            }
            else if(transporter.PanVerified==false)
            {
                res.status(401).send({msg:"PAN card Not Verified"});
            }
            else if(transporter.TinVerified==false)
            {
                res.status(401).send({msg:"TIN card Not Verified"});
            }
            else if (body.Password !== transporter.Password) {
              res.status(401).send({msg:"Invalid Password"});
            } 
            else {
              const token = JWTsign(transporter._id);
              res.send({ token, Email: transporter.Email });
            }
          });
        } catch (error) {
          console.log(error);
        }
      }
      static async Register(req, res) {
        try {
          var user;
          await transporterModel.find({Email:req.body.Email},(err,transporter)=>{
              user = transporter[0];
          })
    
          if(user)
          {   
            if(user.IsVerified===true && user.PanVerified===true && user.TinVerified===true)
            {
              res.status(400).send({msg:"Email already exist"});
              return;
            }
            else if(user.PanVerified==false)
            {
                res.status(401).send({msg:"Email already exist. PAN card Not Verified"});
                return;
            }
            else if(user.TinVerified==false)
            {
                res.status(401).send({msg:"Email already exist. TIN card Not Verified"});
                return;
            }
            else if(user.Rejected!==""){
              await transporterModel.deleteMany({Email:req.body.Email});
              res.status(401).send({msg:user.Rejected});
              return; 
            }
          }
          var OTP = Math.floor(Math.random()*(800000)+100000);
          const mailOptions = {
            from: 'lightningspeed.2021@gmail.com', // sender address
            to: req.body.Email, // list of receivers
            subject: 'LightSpeed OTP verification', // Subject line
            html: `<p>Thank you for registering in our Lightspeed</p><p>OTP is:</p><h1>${OTP}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
          };
          mailTransporter.sendMail(mailOptions, async function (err, info) {
            console.log(info)
            if(err)
                res.status(400).send({msg:"OTP not send"})
            else{
                var data = {...req.body,
                    OTP:OTP,
                    IsVerified:false,
                    PanVerified:false,
                    TinVerified:false,
                    PanCard:"",
                    TinCard:"",
                    Rejected: "",
                    Rating:0,
                    Role:0}
                var newPanPath;
                var newTinPath ,user;
                const transporter = new transporterModel(data);
                await transporter.save(async (error, user) => {
                    if (error) {
                    return res.status(500).send({msg:"Invalid"});
                    } else {       
                    newPanPath = 'public/uploads/PAN/'+("PAN"+user.id)+path.extname(req.files['PanCard'][0].filename);
                    fs.renameSync(req.files['PanCard'][0].path,newPanPath)
                    newTinPath = 'public/uploads/TIN/'+("TIN"+user.id)+path.extname(req.files['TinCard'][0].filename);
                    fs.renameSync(req.files['TinCard'][0].path,newTinPath)
                    await transporterModel.updateOne({_id:user._id},{$set:{PanCard: newPanPath, TinCard : newTinPath }},{multi:true})
                    res.send({msg:"OTP send",Email:user.Email});
                    }
                });
            }
          });
        }catch (error) {
          console.log(error);
        }
      }
    
      static async Verify(req,res){
        try{
            var user;
            await transporterModel.find({Email:req.body.Email},(err,transporter)=>{
                if(err)console.log(err);
                else{
                    if(transporter)
                    {
                        res.status(404).send("Email Not Found");
                        return;
                    }
                    user = transporter[0];
                }
            })
            if(user.OTP===req.body.OTP)
            {
                await transporterModel.updateMany({Email:req.body.Email},{IsVerified:true});
                await transporterModel.find({Email:req.body.Email},(err,user)=>{
                    const token = JWTsign(user[0]._id);
                    res.send({msg:"verified",token});
                }); 
            }
            else{
                OtpSender(req.Email,"Wrong OTP");
            }
        }catch(err){
          console.log(err);
        }
      }
}
module.exports =  Transporter;
