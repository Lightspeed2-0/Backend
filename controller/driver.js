const { driverModel, orderModel, indentModel } = require("../model/index");
const { consignee_login } = require("../model/index");
const { transporterModel } = require("../model/index");

const { JWTsign,JWTverify } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs');
const path = require('path');
const transporter = require("../packages/auth/mailer");

const appendIndents = async (Order)=>{
    for(let i=0;i<Order.Indents.length;i++)
    {
        await indentModel.findById({_id:Order.Indents[i].IndentId},(err,indent)=>{
            if(err)
            {
                console.log(err);
            }
            Order.Indents[i] = indent;
        })  
    }
    // if(Order.length>0)
    // {
    //     let i = Order.length-1;
    //     await indentModel.findById({_id:Order.Indents[i].IndentId},(err,indent)=>{
    //         if(err)
    //         {
    //             console.log(err);
    //         }
    //         Order.Indents[i] = indent;
    //     })  
    // }
    return Order;
}
const appendOrders = async(Orders)=>{
    for(let i=0;i<Orders.length;i++)
    {
        Orders[i] = await appendIndents(Orders[i]._doc);
    }
    // if(Order.length>0)
    // {
    //     let i = Order.length-1;
    //     Orders[i] = await appendIndents(Orders[i]._doc);
    // }
    return Orders;
}
class Driver{
    static async Login(req,res){
        try{
            await driverModel.find({Email:req.body.Email},(err,driver)=>{
                if(err)
                {
                    console.log(err);
                }
                console.log(driver);
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
            await orderModel.find({DriverId:DriverId},async(err,Orders)=>{
                if(err)
                {
                    console.log(err);
                }
                Orders = await appendOrders(Orders);
                res.send({Orders});
            })
        } catch (error) {
            console.log(error);
        }
    }

    static UpdateStatus(req,res){
        var TimeNow = new Date();
        var date = new Date().toLocaleDateString();
        TimeNow = TimeNow.toLocaleTimeString(); 
        indentModel.findById({_id:req.body.IndentId},(err,indent)=>{
            if(indent.Status>=5)
            {
                res.status(400).send({msg:"Order Cancelled"});
            }
            else if(indent.Status>req.body.Status){
                res.status(400).send({msg:"Invalid Updation"});
            }
            else if(indent.Status!==req.body.Status-1)
            {
                res.status(400).send({msg:"Updation can't be skipped"});
    
            }else{
                indentModel.updateOne({_id:req.body.IndentId},{Status:req.body.Status,$push:{StatusStack:{Date:date,Time: TimeNow}}},{ upsert: true, new: true },(err,indents)=>{
                        res.send("Updated");
                    })
            }    
        });
        // indentModel.updateOne({_id:req.body.IndentId},{Status:req.body.Status,$push:{StatusStack:{Date:date,Time: TimeNow}}},{ upsert: true, new: true },(err,indents)=>{
        //     res.send("Updated");
        // })    
    }
}

module.exports = Driver;