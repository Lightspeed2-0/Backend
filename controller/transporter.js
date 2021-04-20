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
            res.status(401).send(msg);
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
				if (!transporter || body.Password !== transporter.Password) {
				res.status(401).send({msg:"Invalid Email or Password "});
				}
				else if(transporter.IsVerified==false)
				{
					OtpSender(transporter.Email,"nootp");
				}
				else if(transporter.PanVerified==false||transporter.TinVerified==false)
				{
					res.status(401).send({msg:"nopan"});
				}
				else {
				const token = JWTsign(transporter._id);
				res.send({ token, Email: transporter.Email ,Username:transporter.Username});
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
				res.status(400).send({msg:"Email already exist"});
				// if(user.IsVerified===true && user.PanVerified===true && user.TinVerified===true)
				// {
				// res.status(400).send({msg:"Email already exist"});
				// return;
				// }
				// else if(user.PanVerified==false)
				// {
				// 	res.status(401).send({msg:"Email already exist. PAN card Not Verified"});
				// 	return;
				// }
				// else if(user.TinVerified==false)
				// {
				// 	res.status(401).send({msg:"Email already exist. TIN card Not Verified"});
				// 	return;
				// }
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
						Role:0
					}
					var newPanPath;
					var newTinPath;
					const transporter = new transporterModel(data);
					await transporter.save(async (error, user) => {
						if (error) {
							return res.status(500).send({msg:"Invalid"});
						}
						else {       
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
					res.send({msg:"nopan"});
				}); 
			}
			else{
				OtpSender(req.Email,"Wrong OTP.New OTP send");
			}
		}
		catch(err){
			console.log(err);
		}
	}

	static async PanStatus(req,res){
		try{
			await transporterModel.findMany({Email:req.body.Email},(err,transporter)=>{
				if(err){
					console.log(err);
				}
				if(!transporter){
					res.send(401).send("Your Request had been declined.");
				}
				else if(transporter[0].PanVerified===true)
				{
					const token = JWTsign(transporter[0]._id);
					res.send({ token, Email: transporter[0].Email ,Username:transporter[0].Username});	
				}else{
					res.status(401).send({msg:"Not Yet Verified"});
				}
			})
		}
		catch(err){
			console.log(err);
		}
	}

	static async PanVerify(req,res){
		
	}
}
module.exports =  Transporter;
