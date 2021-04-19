const express = require("express");
const Router = express.Router();
const multer = require('multer');
const fs = require('fs');
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

Router.post('/',upload.fields([{name:"PanCard"},{name:"TinCard"}]),(req,res)=>{
    console.log(req.files)
   
    const newpath ="./public/uploads/surya.png";
    fs.renameSync(req.files.PanCard[0].path,newpath)
    res.send("OK");
})

module.exports = Router;
