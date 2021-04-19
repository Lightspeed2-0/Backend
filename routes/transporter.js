const express = require("express");
const { Transporter } = require("../controller/index");
const Router = express.Router();
const multer = require('multer');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: function (req, file, next) {
      if(file.fieldname==="PanCard")
        next(null, "./public/uploads/PAN");
      if(file.fieldname === "TinCard")
      next(null, "./public/uploads/TIN");
    },
    filename: function (req, file, next) {
        // console.log("here",req.body)
      next(null, new Date().toISOString() + file.originalname);
    },
  });
const upload = multer({ storage: storage });

Router.post("/login", Transporter.Login);
Router.post("/register",upload.fields([{name:"PanCard"},{name:"TinCard"}]),Transporter.Register);
module.exports = Router;
