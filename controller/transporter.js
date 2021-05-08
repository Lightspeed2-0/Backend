const mongoose = require("mongoose");
const { transporterModel ,bidModel, indentModel, requestModel, consignee_login, driverModel, orderModel} = require("../model/index");
const { JWTsign } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs')
const path = require('path');
const { fstat } = require("fs");
const { OrderSchema } = require("../packages/schemas");

const OtpSender = async(res,Email,msg)=>{
    var OTP = Math.floor(Math.random()*(800000)+100000);
    await transporterModel.updateMany({Email:Email},{OTP:OTP});
    const mailOptions = {
        from: 'lightningspeed.2021@gmail.com', // sender address
        to: Email, // list of receivers
        subject: 'LightSpeed OTP verification', // Subject line
        html: `<p>Thank you for registering in our Lightspeed</p><p>OTP is:</p><h1>${OTP}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
    };
    mailTransporter.sendMail(mailOptions, function (err, info) {
        if(err)console.log(err)
        else{
            res.status(401).send({msg});
        }
        
    })
}
const AppendConsigneeName = async(requests)=>{
	for (let i=requests.length-1;i>=0;i--)
	{
		await consignee_login.find({_id:requests[i].ConsigneeId}, 'Username',(err,consignee)=>{
			if(err)
			{
				console.log(err);
			}
			requests[i] = {...requests[i],Consignee:consignee[0]};
		})
	}
	if(requests.length>0){
			await consignee_login.find({_id:requests[0].ConsigneeId}, 'Username',(err,consignee)=>{
			if(err)
			{
				console.log(err);
			}
			requests[0] = {...requests[0],Consignee:consignee[0]};
		})
	}
	console.log(requests[4]);
	return requests;
}
const AppendIndent = async(requests)=>{
	for(let i=0;i<requests.length;i++)
	{
		await indentModel.find({_id:requests[i].IndentId}, 'Source Destination OrderDate Volume Weight IsPaid IsLTL',(err,indent)=>{
			if(err)
			{
				console.log(err);
			}
			requests[i] = {...requests[i]._doc,Indent:indent[0]};
		})
	}
	requests = await AppendConsigneeName(requests);
	return requests;
}

const appendIndents = async (Order)=>{
	// console.log(Order.Indents)

    for(let i=0;i<Order.Indents.length;i++)
    {
		// console.log(Order.Indents[i])
        await indentModel.findById({_id:Order.Indents[i].IndentId},async(err,indent)=>{
            if(err)
            {
                console.log(err);
            }
			// console.log(indent)
            Order.Indents[i] = {...indent._doc};
			await consignee_login.findById({_id:indent._doc.ConsigneeId},'Username',(err,consignee)=>{
				Order.Indents[i] = {...Order.Indents[i],Consignee:consignee._doc};
			})
        })  
    }
    // if(Order.Indents.length>0)
    // {
    //     let i = Order.Indents.length-1;
	// 	var _id = Order.Indents[i]
	// 	// console.log(i)
    //     // await indentModel.findById({_id:_id},(err,indent)=>{
    //     //     if(err)
    //     //     {
    //     //         console.log(err);
    //     //     }
    //     //     Order.Indents[i] = indent;
    //     // })  
    // }
    return Order;
}
const appendOrders = async(Orders)=>{
    for(let i=0;i<Orders.length;i++)
    {
		// console.log(Orders[i])
		// console.log(i)
        Orders[i] = await appendIndents(Orders[i]._doc);
		await  driverModel.findById({_id:Orders[i].DriverId},'Username',(err,driver)=>{
			Orders[i] = {...Orders[i],Driver:driver._doc}
		})
		// console.log(Orders[i])
		// console.log(i)
    }
    // if(Orders.length>0)
    // {
    //     let i = Orders.length-1;
	// 	// console.log(Orders[0])
	// 	// console.log(i)
		
    //     // Orders[i] = await appendIndents(Orders[i]);
    // }
    return Orders;
}
class Transporter{
    static async Login(req, res) {
        try {
			console.log(req.body)
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
					OtpSender(res,transporter.Email,"nootp");
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
				if(transporter.length>0)
				user = transporter[0];
			})

			if(user)
			{   
				res.status(400).send({msg:"Email already exist"});
				return;
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
							newPanPath = path.join(process.cwd(),'/public/uploads/transporter/PAN/'+("PAN"+user.id)+path.extname(req.files['PanCard'][0].filename));
							fs.renameSync(path.join(process.cwd(),req.files['PanCard'][0].path),newPanPath)
							newPanPath = path.join('uploads/transporter/PAN/'+("PAN"+user.id)+path.extname(req.files['PanCard'][0].filename));
							newTinPath = path.join(process.cwd(),'/public/uploads/transporter/TIN/'+("TIN"+user.id)+path.extname(req.files['TinCard'][0].filename));
							fs.renameSync(path.join(process.cwd(),req.files['TinCard'][0].path),newTinPath)
							newTinPath = path.join('uploads/transporter/TIN/'+("TIN"+user.id)+path.extname(req.files['TinCard'][0].filename));
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
			await transporterModel.find({Email:req.body.Email},async (err,transporter)=>{
				if(err)console.log(err);
				else{
					if(transporter.length == 0)
					{
						res.status(404).send("Email Not Found");
						return;
					}
					else if(transporter[0].OTP==req.body.OTP)
					{
						await transporterModel.updateMany({Email:req.body.Email},{IsVerified:true});
						await transporterModel.find({Email:req.body.Email},(err,user)=>{
							res.send({msg:"nopan"});
						}); 
					}
					else{
						OtpSender(res,req.Email,"Wrong OTP.New OTP send");
					}
				}
			})
		}
		catch(err){
			console.log(err);
		}
	}

	static async PanStatus(req,res){
		try{
			await transporterModel.find({Email:req.body.Email},(err,transporter)=>{
				if(err){
					console.log(err);
				}
				if(transporter.length==0){
					res.status(401).send({msg:"Your Request had been declined.\nRegister again"});
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
	bidDetails(bids){
		for(let i in bids.length){
			bids[i].append = indentModel.findById({_id:bids[i]._id},(err,res)=>{
				if(err)
				{
					console.log(err)
				}
				if(res){
					return res;
				}
			})
		}
		return bids;
	}
	static async GetBids(req,res){
		try {
			await bidModel.find({},'_id indentId',async(err,bids)=>{
				const Bids= await this.bidDetails(bids);
				res.send({bids:Bids});
			})
		} catch (error) {
			console.log(error)
		}
	}
	static async DidBids(req,res){
		try {
			await bidModel.findById({_id:req.body._id},(err,bidDetail)=>{
				var bid = {
					TransporterId: req.body.TransporterId,
					Username: req.body.Username,
					Amount:req.body.Amount
				}
				bidDetail.bids.push({bid});
				bidDetail.NoOfBids = bidDetail.NoOfBids+1;
				bidDetail.save(err=>{
					if(err){
						console.log(err)
					}
					res.send({msg:"Placed Bid Successfully"});
				})
			})
		} catch (error) {
			console.log(error)
		}
	}
	static async Requests(req,res){
		var TransporterId = req.decoded.subject;
		await requestModel.find({TransporterId:TransporterId,Status:{$lt:5}},async(err,requests)=>{
			if(err)
			{
				console.log(err);
			}
			requests = await AppendIndent(requests);
			res.send({requests});
		})
	}

	static async ViewConsignee(req,res){
		await consignee_login.findById({_id:req.body.ConsigneeId},'Username Email MobileNo Rating',(err,consignee)=>{
			if(err)
			{
				console.log(err);
			}
			res.send({consignee});
		})
	}

	static async GetDriver(req,res){
		var TransporterId = req.decoded.subject;
		await driverModel.find({TransporterId : TransporterId},(err,drivers)=>{
			if(err)
			{
				console.log(err);
			}
			res.send({drivers});
		})
	}
	static async AddDriver(req,res){
		var TransporterId = req.decoded.subject;
		await transporterModel.findById({_id:TransporterId},async(err,transporter)=>{
			if(err)
			{
				console.log(err);
			}
			if(transporter)
			{
				const data ={
					...req.body,
					Rating : 0,
					TransporterId,
					TransporterName : transporter.Username
				}
				const driver = new driverModel(data);
				driver.save(err=>{
					if(err)
					{
						console.log(err);
						res.status(500);
					}else{
						res.send({msg:"added"});
					}
				})
			}
		})
	}

	static async RemoveDriver(req,res){
		var TransporterId = req.decoded.subject;
		await driverModel.deleteMany({_id:req.body._id,TransporterId:TransporterId},(err,driver)=>{
			if(err)
			{
				console.log(err)
			}
			if(driver){
				res.send({msg:"removed"});
			}else{
				res.send({msg:"failed"});
			}
		})
	}

	static async RespondRequest(req,res){
		var TransporterId = req.decoded.subject;
		if(req.body.IsAccepted === true)
		{
			requestModel.updateMany({TransporterId:TransporterId,_id:req.body.RequestId},{Status:2,Amount:req.body.Amount},(err,request)=>{
				if(err)
				{
					console.log(err);
				}
				console.log(request)
				if(request.n>0)
				{
					res.send({msg:"success"});
				}else{
					res.send({msg:"failed"});
				}
			})
		}else{
			requestModel.updateMany({TransporterId:TransporterId,_id:req.body.RequestId},{Status:1},(err,request)=>{
				if(err)
				{
					console.log(err);
				}
				if(request.n>0)
				{
					res.send({msg:"success"});
				}else{
					res.send({msg:"failed"});
				}
			})
		}
	}
	static async AllocateDriver(req,res){
		var TransporterId = req.decoded.subject;
		try{
			var request = await requestModel.findById({_id:req.body.RequestId});
			if(request)
			{
				await indentModel.updateMany({_id:request.IndentId},{TransporterId:TransporterId,Amount:request.Amount,Status:0});
				request.Status = 5;
				request.save();
				var order= new orderModel({Indents: [{IndentId:request.IndentId}],TransporterId,DriverId : req.body.DriverId});
				order.save(async(err,order)=>{
					if(err)
					{
						console.log(err);
					}
					var TimeNow = new Date();
					var date = new Date().toLocaleDateString();
					TimeNow = TimeNow.toLocaleTimeString(); 
					await indentModel.updateMany({_id:request.IndentId},{OrderId:order._id,$push:{StatusStack:{Date:date,Time: TimeNow}}},{ upsert: true, new: true });
					res.send({msg:"allocated"});
				})
			}
			else{
				res.status(400).send({msg:"No such request"});
			}
			
		}catch(err)
		{
			console.log(err);
		}
	}

	static async GetOrders(req,res){
		var TransporterId = req.decoded.subject;
		await orderModel.find({TransporterId:TransporterId},async(err,Orders)=>{
			if(err)
                {
                    console.log(err);
                }
                Orders = await appendOrders(Orders);
                res.send({Orders});
		})
	}

	static async CancelOrder(req,res){
		var TransporterId = req.decoded.subject;
		var IndentId = req.body.IndentId;
		// console.log(TransporterId)
		indentModel.find({_id:IndentId,TransporterId:TransporterId}).then((indent)=>{
			if(indent.length>0)
			{ 
				if(indent[0].Status<2)
				{
					indentModel.updateOne({_id:indent[0]._id},{Status:5}).then(indent=>{
						res.send({msg:"cancel success"});
					})
				}
				else{
					res.send({msg:"cancel failed"});
				}
			}
			else{
				res.status(400).send({msg:"no order found"});
			}
		})
	}
}
module.exports =  Transporter;
