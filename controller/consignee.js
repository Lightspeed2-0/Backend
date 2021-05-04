const { consignee_login,transporterModel , indentModel ,requestModel ,bidModel,orderModel} = require("../model/index");
const { JWTsign } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs');
const path = require('path');
const { static } = require("express");

class Consignee {
	static async Login(req, res) {
		try {
			const body = req.body;
			consignee_login.findOne({ Email: body.Email }, (err, consignee) => {
				if (err) {
					console.log(err);
				}
				if (!consignee||body.Password !== consignee.Password) {
					res.status(401).send({msg:"Invalid Email Id or Password"});
				}
				else if (consignee.IsVerified==false) {
					res.status(401).send({msg:"nootp"});
				}
				else if (consignee.PanVerified==false) {
					res.status(401).send({msg:"nopan"});
				}
				else {
					const token = JWTsign(consignee._id);
					res.send({ token, Email: consignee.Email ,Username:consignee.Username});
				}
			});
		}catch (error) {
			console.log(error);
		}
	}
  static async Register(req, res) {
    try {
		var user;
		// console.log(req.file)
		await consignee_login.find({Email:req.body.Email},(err,consignee)=>{
			// console.log(consignee[0])
			user = consignee[0];
		})

		if(user)
		{   
			if(user.PanVerified===true)
			{
			res.status(400).send({msg:"Email already exist"});
			return;
			}else{
				await consignee_login.deleteMany({Email:req.body.Email},(err,consignee)=>{
					if(consignee.length>0)
					fs.unlinkSync(path.join("../public"+consignee[0].PanCard))
				});
			
			}
		}
		var OTP = Math.floor(Math.random()*(800000)+100000);
		const mailOptions = {
			from: 'lightningspeed.2021@gmail.com', // sender address
			to: req.body.Email, // list of receivers
			subject: 'LightSpeed OTP verification', // Subject line
			html: `<p>Thank you for registering in our Lightspeed</p><p>OTP is:</p><h1>${OTP}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
		};
		mailTransporter.sendMail(mailOptions, function (err, info) {
			// console.log(info)
			if(err)
			res.status(400).send({msg:"OTP not send"})
			else{
			var data = {...req.body,
				OTP:OTP,
				PanVerified:false,
				PanCard:"",
				IsVerified:false,
				Rating:0,
				Role:0
			}
			const consignee = new consignee_login(data);
			consignee.save(async (error, consignee) => {
				if (error) {
					return res.status(500).send({msg:"Invalid"});
				} else {
					var newPanPath = path.join(process.cwd(),'/public/uploads/consignee/PAN/'+("PAN"+consignee.id)+path.extname(req.files['PanCard'][0].filename));
					// newPanPath = 'public/uploads/consignee/PAN/'+("PAN"+consignee.id)+path.extname(req.file.filename);
					fs.renameSync(path.join(process.cwd(),req.files['PanCard'][0].path),newPanPath)
					newPanPath = path.join('uploads/consignee/PAN/'+("PAN"+consignee.id)+path.extname(req.files['PanCard'][0].filename));
					await consignee_login.updateOne({_id:consignee._id},{$set:{PanCard: newPanPath}},{multi:true})
					res.send({msg:"nootp",Email:consignee.Email});
				}
			});
			}
		});
		} catch (error) {
		console.log(error);
		}
	}

	static async Verify(req,res){
		try{
			await consignee_login.find({Email:req.body.Email},async(err,consignee)=>{
				if(err)console.log(err);
				else{
					if(consignee.length===0)
					{
						return res.status(404).send("Email Not Found");
					}
					else if(consignee[0].OTP===req.body.OTP)
					{
						await consignee_login.updateMany({Email:req.body.Email},{IsVerified:true});
						await consignee_login.find({Email:req.body.Email},(err,user)=>{
							res.send({msg:"nopan"});
						}); 
					}
					else{
						var OTP = Math.floor(Math.random()*(800000)+100000);
						await consignee_login.updateMany({Email:req.body.Email},{OTP:OTP});
						const mailOptions = {
							from: 'lightningspeed.2021@gmail.com', // sender address
							to: req.body.Email, // list of receivers
							subject: 'LightSpeed OTP verification', // Subject line
							html: `<p>Thank you for registering in our Lightspeed</p><p>OTP is:</p><h1>${OTP}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
						};
						mailTransporter.sendMail(mailOptions, function (err, info) {
							if(err)console.log(err)
							else{
								res.status(400).send({msg:"Wrong OTP.New OTP send"});
							}
						})
					}
				}
			})
		}catch(err){
			console.log(err);
		}
	}
	static async PanStatus(req,res){
		try{
			await consignee_login.find({Email:req.body.Email},(err,consignee)=>{
				if(err){
					console.log(err);
				}
				if(consignee.length==0){
					res.send(401).send("Your Request had been declined.");
				}
				else if(consignee[0].PanVerified===true)
				{
					const token = JWTsign(consignee[0]._id);
					res.send({ token, Email: consignee[0].Email ,Username:consignee[0].Username});	
				}else{
					res.status(401).send({msg:"Not Yet Verified"});
				}
			})
		}
		catch(err){
			console.log(err);
		}
	}
	static async GetTransporter(req,res){
		try{
			await transporterModel.find({},'_id Username',(err,transporters)=>{
				if(err)
				{
					console.log(err);
				}else{
					console.log(transporters)
					res.send({transporters})
				}
			})
		}catch(Err)
		{
			console.log(Err);
		}	
	}

	static async CreateIndent(req,res){
		const ConsigneeId = req.decoded.subject;
		let body = req.body;
		const {TransporterId,...refdata} = body
		// console.log(body)
		let data = {...refdata,
					ConsigneeId,
					Amount : -1,
					IsPaid : false,
					PaymentId : null,
					Status : -1
					}
		const indent = new indentModel(data);
		indent.save((err,indents)=>{
			if(err){
				console.log(err);
				res.status(404);
			}else{
				const request = new requestModel({
					ConsigneeId: ConsigneeId,
					TransporterId: TransporterId,
					IndentId: indents._id,
					TransporterDeleted: false,
					ConsigneeDeleted: false,
					Amount: -1,
					Status : 0
				})
				request.save((err,request)=>{
					if(err)
					{
						console.log(err);
						res.status(404);
					}else{
						res.send({indent:indents});
					}
				})
			}
		}) 
	}
	
	static async YourOrders(req,res){
		var ConsigneeId = req.decoded.subject;
		await indentModel.find({ConsigneeId},async (err,indents)=>{
			if(err){
				console.log(err);
			}
			// console.log("h")
			var finalIndents = await Consignee.appendRequests(indents);
			// console.log(/"ere")
			res.send({indents : finalIndents});
		})
	}
	static async appendRequests(indents){
		// console.log(indents.length)
		for(let i = 0 ;i<indents.length;i++){
			if(indents[i].Status === -1)
			{
				await requestModel.find({IndentId:indents[i]._id},(err,request)=>{
					// console.log(request[0])
					indents[i]= {...indents[i]._doc,...{request:request[0]}};
				}) 
			}
		}
		return indents;
	}
	static async CreateBid(req,res){
		const ConsigneeId = req.decoded.subject;
		let body = req.body;
		const {refdata} = {body}
		let data = {...refdata,
					ConsigneeId,
					Amount : -1,
					IsPaid : false,
					PaymentId : null,
					Status : 0
					}
		const indent = new indentModel(data);
		indent.save((err,indents)=>{
			if(err){
				console.log(err);
				res.status(404);
			}else{
				const bid = new bidModel({
					ConsigneeId: ConsigneeId,
					IndentId: indents._id,
					BidStatus:"created",
					NoOfBids:0,
					Bids:[],
					Amount: -1
				})
				bid.save((err,bid)=>{
					if(err)
					{
						console.log(err);
						res.status(404);
					}else{
						res.send({bid:bids});
					}
				})
			}
		}) 
	}
	static async ViewTransporter(req,res){
		await transporterModel.findById({_id:req.body.TransporterId},'Username Email MobileNo Rating',(err,transporter)=>{
			if(err)
			{
				console.log(err);
			}
			res.send({transporter});
		})
	}
	static async ViewDriver(req,res){
		await driverModel.findById({_id:req.body.DriverId},'Username Email MobileNo Rating',(err,driver)=>{
			if(err)
			{
				console.log(err);
			}
			res.send({driver});
		})
	}

	static async IndentConfirm(req,res){
		var ConsigneeId = req.decoded.subject;
		if(req.body.IsAccepted === true)
		{
			await requestModel.updateMany({ConsigneeId:ConsigneeId,_id:req.body.RequestId},{Status:4},(err,request)=>{
				if(err)
				{
					console.log(err);
				}
				res.send({msg:"Payment Successful"})
			});

		}else{
			requestModel.updateMany({ConsigneeId:ConsigneeId,_id:req.body.RequestId},{Status:3},(err,request)=>{
				if(err)
				{
					console.log(err);
				}
				if(request.n>0)
				{
					res.send({msg:"successfully declined"});
				}else{
					res.send({msg:"failed"});
				}
			})
		}
	}
}

module.exports = Consignee;
