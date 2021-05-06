const express = require("express");
const { Transporter } = require("../controller/index");
const { Auth } = require('../packages/middleware/authindex')
const Router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, next) {
      if(file.fieldname==="PanCard")
        next(null, "./public/uploads/transporter/PAN");
      if(file.fieldname === "TinCard")
      next(null, "./public/uploads/transporter/TIN");
    },
    filename: function (req, file, next) {
        // console.log("here",req.body)
      next(null, new Date().toISOString() + file.originalname);
    },
  });
const upload = multer({ storage: storage });

Router.post("/login", Transporter.Login);
Router.post("/register",upload.fields([{name:"PanCard"},{name:"TinCard"}]),Transporter.Register);
Router.post("/verify",Transporter.Verify);
Router.post("/panstatus",Transporter.PanStatus);
Router.get("/requests",Auth,Transporter.Requests);
Router.post("/viewConsignee",Auth,Transporter.ViewConsignee);
Router.post("/allocateDriver",Auth,Transporter.AllocateDriver);
Router.get("/getDriver",Auth,Transporter.GetDriver);
Router.post("/addDriver",Auth,Transporter.AddDriver);
Router.post("/removeDriver",Auth,Transporter.RemoveDriver);
Router.post("/respondRequest",Auth,Transporter.RespondRequest);
Router.get("/getOrders",Auth,Transporter.GetOrders);
Router.post("/cancelOrder",Auth,Transporter.CancelOrder);

module.exports = Router;
