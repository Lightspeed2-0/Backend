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
                        console.log(JWTverify(token))
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
        await consignee_login.find({PanVerified: false,IsVerified: false},'_id Username PanCard',(err,consignees)=>{
            if(err)
            {
                console.log(err)
            }
            console.log(consignees)
            res.send(consignees);
        });
    }
    static async GetTransporter(req,res){
        await transporterModel.find({PanVerified: false,IsVerified: false},'_id Username PanCard TinCard',(err,Transporters)=>{
            if(err)
            {
                console.log(err)
            }
            console.log(Transporters)
            res.send(Transporters);
        });
    }

    static async VerifyConsignee(req,res){
        
    }

    static async VerifyTransporter(req,res){
        
    }
}

module.exports = Admin;