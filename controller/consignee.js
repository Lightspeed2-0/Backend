const { consignee_login } = require("../model/index");
const { JWTsign } = require("../packages/auth/tokenize");
const mailTransporter = require("../packages/auth/mailer");
const fs = require('fs');

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
					res.send({ token, Email: consignee.Email });
				}
			});
		}catch (error) {
			console.log(error);
		}
	}
  static async Register(req, res) {
    try {
		var user;
		// console.log("here")
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
					fs.unlinkSync(path.join("../public"+consignee.PanCard))
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
			console.log(info)
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
					newPanPath = 'public/uploads/consignee/PAN/'+("PAN"+consignee.id)+path.extname(req.file.filename);
					fs.renameSync(req.file.path,newPanPath)
					await consignee_login.updateOne({_id:consignee._id},{$set:{PanCard: newPanPath}},{multi:true})
					res.send({msg:"OTP send",Email:consignee.Email});
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
			var user;
			await consignee_login.find({Email:req.body.Email},(err,consignee)=>{
				if(err)console.log(err);
				else{
				user = consignee[0];
				}
			})
			// console.log(user)
			// console.log(user.OTP,req.body.OTP)
			if(user.OTP===req.body.OTP)
			{
				await consignee_login.updateMany({Email:req.body.Email},{IsVerified:true});
				await consignee_login.find({Email:req.body.Email},(err,user)=>{
					// console.log(user)
					const token = JWTsign(user[0]._id);
					res.send({msg:"verified",token});
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
						res.status(400).send("New OTP send");
					}
				})
			}
		}catch(err){
			console.log(err);
		}
	}
	static async PanStatus(req,res){
		try{
			await consignee_login.findMany({Email:req.body.Email},(err,consignee)=>{
				if(err){
					console.log(err);
				}
				if(!consignee){
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
	static async PanVerify(req,res){
		
	}
}
module.exports = Consignee;
