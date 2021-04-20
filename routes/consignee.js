const express = require("express");
const { Consignee } = require("../controller/index");
const Router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, next) {
      if(file.fieldname==="PanCard")
        next(null, "./public/uploads/consignee/PAN");
    },
    filename: function (req, file, next) {
      next(null, new Date().toISOString() + file.originalname);
    },
  });
const upload = multer({ storage: storage });

Router.post("/login", Consignee.Login);
Router.post("/register",upload.single("PanCard"),Consignee.Register);
Router.post("/verify", Consignee.Verify);
Router.post("/panstatus",Consignee.PanStatus);

module.exports = Router;
