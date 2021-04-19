const { consignee_login } = require("../model/index");
const { JWTsign } = require("../packages/auth/tokenize");
const transporter = require("../packages/auth/mailer");

class Consignee {
  static async Login(req, res) {
    try {
      const body = req.body;
      consignee_login.findOne({ Email: body.Email }, (err, consignee) => {
        if (err) {
          console.log(err);
        }
        console.log(consignee);
        if (!consignee||consignee.IsVerified==false) {
          res.status(401).send({msg:"Invalid Email Id"});
        } else if (body.Password !== consignee.Password) {
          res.status(401).send({msg:"Invalid Password"});
        } else {
          const token = JWTsign(consignee._id);
          res.send({ token, Email: consignee.Email });
        }
      });
    } catch (error) {
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
        if(user.IsVerified===true)
        {
          res.status(400).send({msg:"Email already exist"});
          return;
        }else{
          await consignee_login.deleteMany({Email:req.body.Email});
        }
      }
      var OTP = Math.floor(Math.random()*(800000)+100000);
      const mailOptions = {
        from: 'lightningspeed.2021@gmail.com', // sender address
        to: req.body.Email, // list of receivers
        subject: 'LightSpeed OTP verification', // Subject line
        html: `<p>Thank you for registering in our Lightspeed</p><p>OTP is:</p><h1>${OTP}</h1><br><br><p>Thanks & Regards</p><p>Lightspeed Team</p>`// plain text body
      };
      transporter.sendMail(mailOptions, function (err, info) {
        console.log(info)
        if(err)
          res.status(400).send({msg:"OTP not send"})
        else{
          var data = {...req.body,
            OTP:OTP,
            IsVerified:false,
            Rating:0,
            Role:0}
          const consignee = new consignee_login(data);
          consignee.save((error, consignee) => {
            if (error) {
              return res.status(500).send({msg:"Invalid"});
            } else {
              // console.log("gere")
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
        transporter.sendMail(mailOptions, function (err, info) {
          if(err)console.log(err)
          else
          res.status(400).send("New OTP send");
        })
      }
    }catch(err){
      console.log(err);
    }
  }
}
  module.exports = Consignee;
