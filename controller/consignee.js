const { consignee_login,transporterModel , indentModel ,requestModel ,bidModel,orderModel, driverModel, quotationModel, poolingRequestModel} = require("../model/index");
const { JWTsign } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs');
const path = require('path');
const { static } = require("express");

const PincodeDistance = require("pincode-distance").default;

const Pincode = new PincodeDistance();

const appendTransporter = async(quotes)=>{
	for (let i=0;i<quotes.length;i++)
	{
		await transporterModel.findById({_id:quotes[i].TransporterId},'Username').then(transporter=>{
			quotes[i] = {...quotes[i]._doc,transporter}
		})
	}
	return quotes;
}
const appendQuotes = async (bids)=>{
	for(let i=0;i<bids.length;i++)
	{
		bids[i]=bids[i]._doc;
		await indentModel.findById({_id:bids[i].IndentId}).then(indent=>{
			bids[i] = {...bids[i],indent:indent._doc}
		})
		await quotationModel.find({BidId:bids[i]._id}).sort({Amount:1}).then(async(quotes)=>{
			// console.log( quotes);
			quotes = await appendTransporter(quotes);
			bids[i]={...bids[i],quotes};
		})
	}
	return bids;
}
const appendRequests = async(indents)=>{
	console.log(indents.length)
	for(let i =indents.length-1;i>=0;i--){
		console.log(i,indents[i].Status)
		if(indents[i].Status === -1)
		{
			await requestModel.find({IndentId:indents[i]._id},(err,request)=>{
				if(request.length>0)
				{
					indents[i]= {...indents[i]._doc,...{request:request[0]}};
					transporterModel.findById({_id:request[0].TransporterId},'Username').then(transporter=>{
						indents[i] = {...indents[i],Transporter:transporter}
					})
				}
			}) 
			
		}else{
			await transporterModel.findById({_id:indents[i].TransporterId},'Username').then(transporter=>{
				indents[i] = {...indents[i]._doc,Transporter:transporter}
			})
			await orderModel.findById({_id:indents[i].OrderId}).then(async (order)=>{
				// console.log(order)
				await driverModel.findById({_id:order.DriverId},'Username').then(driver=>{
					indents[i] = {...indents[i],driver:driver}
					console.log(indents[i])
				})
			})
			
		}
	}
	if(indents.length>0)
	{
		let i=0;
		// console.log(indents[0])
		if(indents[0].Status === -1)
		{
			await requestModel.find({IndentId:indents[i]._id},(err,request)=>{
				if(request.length>0)
				{
					indents[i]= {...indents[i],...{request:request[0]}};
					transporterModel.findById({_id:request[0].TransporterId},'Username').then(transporter=>{
						indents[i] = {...indents[i],Transporter:transporter}
					})
				}
			}) 
		}else{
			await transporterModel.findById({_id:indents[i].TransporterId},'Username').then(transporter=>{
				indents[i] = {...indents[i],Transporter:transporter}
			})
			await orderModel.findById({_id:indents[i].OrderId}).then(async (order)=>{
				// console.log(order)
				await driverModel.findById({_id:order.DriverId},'Username').then(driver=>{
					indents[i] = {...indents[i],driver:driver}
					console.log(indents[i])
				})
			})
			
		}
	}
	return indents;
}
const appendPoolRequest = async(indents)=>{
	for(let i=0;i<indents.length;i++)
	{
	  if(indents[i].Status === -3)
	  {
		await poolingRequestModel.find({IndentId:indents[i]._doc._id},(err,request)=>{
			indents[i] = {...indents[i]._doc,request:request[0]};
		  })
	  }
	}
	return indents
}

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
			// console.log(req.body)
			await consignee_login.find({Email:req.body.Email},async(err,consignee)=>{
				if(err)console.log(err);
				else{
					if(consignee.length===0)
					{
						return res.status(404).send({msg:"Email Not Found"});
					}
					else if(consignee[0].OTP==req.body.OTP)
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
					// console.log(transporters)
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
		var {TransporterId,Source,Destination,...refdata} = body
		// console.log(body)
		var Geolocation = Pincode.getlatLng(Source.Pincode);
		Source = {...Source, Geolocation}
		Geolocation = Pincode.getlatLng(Destination.Pincode)
		Destination ={...Destination,Geolocation}
		let data = {...refdata,
					Source,
					Destination,
					ConsigneeId,
					OrderId: "",
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
		await indentModel.find({ConsigneeId,Status:{$gt:-2}},async (err,indents)=>{
			if(err){
				console.log(err);
			}
			// console.log("h")
			var finalIndents = await appendRequests(indents);
			console.log(finalIndents)
			// console.log(finalIndents)
			res.send({indents : finalIndents});
		})
	}
	static async CreateBid(req,res){
		const ConsigneeId = req.decoded.subject;
		let body = req.body;
		var {Source,Destination,...refdata} = body
		// console.log(body)
		var Geolocation = Pincode.getlatLng(Source.Pincode);
		Source = {...Source, Geolocation}
		Geolocation = Pincode.getlatLng(Destination.Pincode)
		Destination ={...Destination,Geolocation}
		let data = {...refdata,
					Source,
					Destination,
					ConsigneeId,
					Amount : -1,
					IsPaid : false,
					PaymentId : null,
					Status : -2
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
					BidStatus:0,
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
						res.send({msg:"success"});
					}
				})
			}
		}) 
	}

	static GetBids(req,res){
		var ConsigneeId = req.decoded.subject;
		bidModel.find({ConsigneeId:ConsigneeId}).then(async(bids)=>{
			bids = await appendQuotes(bids);
			res.send({bids:bids});
		})
	}

	static CloseBid(req,res){
		var ConsigneeId = req.decoded.subject;
		var BidId= req.body.BidId;
		bidModel.find({ConsigneeId,_id:BidId}).then(bids=>{
			if(bids.length==0)
			{
				res.send({msg:'nobids'})
			}else{
				bidModel.deleteOne({_id:BidId}).then(bid=>{
					quotationModel.deleteMany({BidId:BidId}).then(quotes=>{
						res.send({msg:'success'});
					})
				})
			}
		})
	}

	static async AcceptBid(req,res){
		var BidId = req.body.BidId;
		var TransporterId = req.body.TransporterId;
		var ConsigneeId = req.decoded.subject;
		await bidModel.findById({_id:BidId},async (err,bid)=>{
			await quotationModel.find({BidId:BidId,TransporterId:TransporterId}).then(async(quote)=>{
				// console.log(quote)
				const request = new requestModel({
					ConsigneeId: ConsigneeId,
					TransporterId: TransporterId,
					IndentId: bid._doc.IndentId,
					TransporterDeleted: false,
					ConsigneeDeleted: false,
					Amount: quote[0].Amount,
					Status : 2
				})
				// console.log(request)
				request.save();
				await indentModel.updateMany({_id:bid._doc.IndentId},{Status:-1});
				await bidModel.updateMany({_id:BidId},{BidStatus:1});
				await quotationModel.deleteMany({BidId:BidId,TransporterId:{$ne:TransporterId}}).then(quotes=>{
					res.send({msg:"success"})
				})
			// res.send({msg:"sucedd"})
			})
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
			await requestModel.updateMany({ConsigneeId:ConsigneeId,_id:req.body.RequestId},{Status:4},async(err,request)=>{
				if(err)
				{
					console.log(err);
				}
				// console.log(req.body.IndentId)
				await indentModel.updateMany({_id:req.body.IndentId},{IsPaid:true},err=>{
					// console.log("sfs");
					res.send({msg:"Payment Successful"});
				});
				
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

	static async CancelOrder(req,res){
		var ConsigneeId = req.decoded.subject;
		var IndentId = req.body.IndentId;
		indentModel.find({_id:IndentId,ConsigneeId:ConsigneeId}).then((indent)=>{
			if(indent[0].Status<2)
			{
				indentModel.updateOne({_id:indent[0]._id},{Status:5}).then(indent=>{
					res.send({msg:"cancel success"});
				})
			}
			else{
				res.send({msg:"cancel failed"});
			}
		})
	} 

	static async CreatePool(req,res){
		const ConsigneeId = req.decoded.subject;
		let body = req.body;
		var {Source,Destination,...refdata} = body
		// console.log(body)
		var Geolocation = Pincode.getlatLng(Source.Pincode);
		Source = {...Source, Geolocation}
		Geolocation = Pincode.getlatLng(Destination.Pincode)
		Destination ={...Destination,Geolocation}
		let data = {...refdata,
					Source,
					Destination,
					ConsigneeId,
					OrderId: "",
					Amount : -1,
					IsPaid : false,
					PaymentId : null,
					Status : -4
		}
		const indent = new indentModel(data);
		indent.save(err=>{
			if(err)
			{
				console.log(err);
				res.status(500).send({msg:"Internal Error"})
			}else
			res.send({msg:"success"});
		})
	}
	static async GetPool(req,res){
		const ConsigneeId = req.decoded.subject;
		indentModel.find({ConsigneeId,$or:[{'Status' : -4},{'Status':-3}]},async(err,indents)=>{
			if(err)
			{
				console.log(err);
				res.status(500).send({msg:"DataBase Error"});
			}else{
        		indents = await appendPoolRequest(indents);
				res.send({indents})
			}
		})
	}

	static async RequestPool(req,res){
		const ConsigneeId = req.decoded.subject;
		const request = new poolingRequestModel({
			ConsigneeId: ConsigneeId,
			...req.body,
			TransporterDeleted: false,
			ConsigneeDeleted: false,
			Amount: -1,
			Status : 0
		})
		await indentModel.updateMany({_id:req.body.IndentId},{Status:-3});
		request.save((err,request)=>{
			if(err)
			{
				console.log(err);
				res.status(500);
			}else{
				res.send({msg:"success"});
			}
		})
	}

	static async PoolingConfirm(req,res){
		var ConsigneeId = req.decoded.subject;
		if(req.body.IsAccepted === true)
		{
			await poolingRequestModel.updateMany({ConsigneeId:ConsigneeId,_id:req.body.PoolingRequestId},{Status:4},async(err,request)=>{
				if(err)
				{
					console.log(err);
				}
				await indentModel.updateMany({_id:req.body.IndentId},{IsPaid:true},err=>{
					res.send({msg:"Payment Successful"});
				});
				
			});

		}else{
			poolingRequestModel.updateMany({ConsigneeId:ConsigneeId,_id:req.body.PoolingRequestId},{Status:3},(err,request)=>{
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

	static async RecommendPooling(req,res){
		orderModel.find({},(err,orders)=>{
			if(err)
			{
				console.log(err);
				res.status(500).send({msg:"Database Error"});
			}else{
				res.send({orders})
			}
		})
	}

}

module.exports = Consignee;
