const express = require("express");
const Router = express.Router();
const multer = require('multer');
const fs = require('fs');
const {indentModel} = require('../model/index');
const storage = multer.diskStorage({
    destination: function (req, file, next) {
      next(null, "./public/uploads/");
    },
    filename: function (req, file, next) {
        // console.log("here",req.body)
        // console.log(file)
      next(null, new Date().toISOString() + file.originalname);
    },
  });
  const upload = multer({ storage: storage });
const appendPoolRequest = async(indents)=>{
  for(let i=0;i<indents.length;i++)
  {
    if(indents[i].Status === -3)
    await indentModel.findById({_id:indents[i]._id},(err,indent)=>{
      indents[i] = {...indents[i]._doc,indent};
    })
  }
  return indents
}
Router.get('/',async(req,res)=>{
    // console.log(req.files)
   
    // const newpath ="./public/uploads/surya.png";
    // fs.renameSync(req.files.PanCard[0].path,newpath)
    // res.send("OK");
    // var indent = await indentModel.findById({_id:"609e1fc1f844d02e3a8b37df"});
    // console.log(indent);
    // const ConsigneeId = req.decoded.subject;
		indentModel.find({ConsigneeId:"60883b6aa72f47000485d79a",$or:[{'Status' : -4},{'Status':-3}]},async(err,indents)=>{
			if(err)
			{
				console.log(err);
				res.status(500).send({msg:"DataBase Error"});
			}else{
        indents = await appendPoolRequest(indents);
				res.send({indents})
			}
		})
})

module.exports = Router;
