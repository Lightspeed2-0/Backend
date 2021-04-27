const { adminModel } = require("../model/index");
const { consignee_login } = require("../model/index");
const { transporterModel } = require("../model/index");

const { JWTsign,JWTverify } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs');
const path = require('path');

class Admin{
    static async Login(req,res){
        try{
            await adminModel.find({Username:req.body.Username},(err,admin)=>{
                if(err)
                {
                    console.log('err');
                }
                if(admin.length == 0)
                {
                    res.status(401).send({msg:"Invalid Username"});
                }else{
                    if(admin[0].Password === req.body.Password)
                    {
                        var token = JWTsign("admin");
                        res.send({token,Username : admin[0].Username});
                    }else{
                        res.status(401).send({msg:"Invalid Password"});
                    }
                }
            })
        }
        catch(err){
            console.log(err)
        }
        
    }

    static async GetConsignee(req,res){
        await consignee_login.find({PanVerified: false,IsVerified: true},'_id Username PanCard',(err,consignees)=>{
            if(err)
            {
                console.log(err)
            }
            console.log(consignees)
            res.send(consignees);
        });
    }
    static async GetTransporter(req,res){
        // JWTverify(req.body.token)
        await transporterModel.find({PanVerified: false,IsVerified: true},'_id Username PanCard TinCard',(err,Transporters)=>{
            if(err)
            {
                console.log(err)
            }
            // console.log(Transporters)
            res.send(Transporters);
        });
    }

    static async VerifyConsignee(req,res){
        if(req.body.IsAccepted === true){
            await consignee_login.updateMany({_id:req.body._id},{PanVerified:true});
            res.send({msg:"success"});
        }else{
            await consignee_login.findById({_id:req.body._id},async(err,consignee)=>{
                if(err)
                {
                    console.log(err);
                }
                if(consignee)
                {
                    const mailOptions = {
                        from: 'lightningspeed.2021@gmail.com', // sender address
                        to: consignee.Email, // list of receivers
                        subject: 'LightSpeed Application Declined', // Subject line
                        html: `<p>Your LightSpeed Consignee Application reject.Your request has been cancelled because of reason mentioned below.</p><p>Reason:</p><h1>${req.body.msg}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
                    };
                    mailTransporter.sendMail(mailOptions, function (err, info) {
                        if(err)console.log(err)
                        else{
                            res.status(401).send({msg});
                        }
                    })
                    await consignee_login.deleteOne({_id:consignee._id});
                    
                    if(fs.existsSync("./public/"+consignee.PanCard))
                    {
                        fs.unlinkSync("./public/"+consignee.PanCard)
                    }
                    res.send({msg:"success"});
                }else{
                    res.send({msg:"User Not Found"});
                }
            })
        }
    }

    static async VerifyTransporter(req,res){
        
        if(req.body.IsAccepted === true){
            await transporterModel.updateMany({_id:req.body._id},{PanVerified:true,TinVerified: true});
            res.send({msg:"success"});
        }else{
            await transporterModel.findById({_id:req.body._id},async(err,transporter)=>{
                if(err)
                {
                    console.log(err);
                }
                if(transporter)
                {
                    const mailOptions = {
                        from: 'lightningspeed.2021@gmail.com', // sender address
                        to: transporter.Email, // list of receivers
                        subject: 'LightSpeed Application Declined', // Subject line
                        html: `<p>Your LightSpeed transporter Application reject.Your request has been cancelled because of reason mentioned below.</p><p>Reason:</p><h1>${req.body.msg}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
                    };
                    mailTransporter.sendMail(mailOptions, function (err, info) {
                        if(err)console.log(err)
                        else{
                            res.status(401).send({msg});
                        }
                    })
                    await transporterModel.deleteOne({_id:transporter._id});
                    
                    if(fs.existsSync("./public/"+transporter.PanCard))
                    {
                        fs.unlinkSync("./public/"+transporter.PanCard)
                    }
                    if(fs.existsSync("./public/"+transporter.TinCard))
                    {
                        fs.unlinkSync("./public/"+transporter.TinCard)
                    }
                    res.send({msg:"success"});
                }else{
                    res.send({msg:"User Not Found"});
                }
            })
        }
    }
}

module.exports = Admin;