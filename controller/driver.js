const { driverModel, orderModel } = require("../model/index");
const { consignee_login } = require("../model/index");
const { transporterModel } = require("../model/index");

const { JWTsign,JWTverify } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs');
const path = require('path');
const transporter = require("../packages/auth/mailer");

// const appendIndents = async (Orders)=>{

// }
// const appendOrders = async(Orders)=>{
//     for(let i=0;i<Orders.length;i++)
//     {
//         Orders[i] = await appendIndents(Orders[i]._doc);
//     }
//     return Orders;
// }
class Driver{
    static async Login(req,res){
        try{
            await driverModel.find({Email:req.body.Email},(err,driver)=>{
                if(err)
                {
                    console.log('err');
                }
                if(driver.length == 0)
                {
                    res.status(401).send({msg:"Invalid Username"});
                }else{
                    if(driver[0].Password === req.body.Password)
                    {
                        var token = JWTsign(driver[0]._id);
                        res.send({token,Username : driver[0].Username});
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
    static async GetOrder(req,res){
        var DriverId = req.decoded.subject;
        try {
            await orderModel.find({DriverId},async(err,Orders)=>{
                if(err)
                {
                    console.log(err);
                }
                // Orders = await appendOrders(Orders);
                res.send({Orders});
            })
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Driver;