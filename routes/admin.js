const express = require("express");
const { Admin } = require("../controller/index");
const {adminAuth} = require("../packages/middleware/adminauth");
const Router = express.Router();

Router.post("/login", Admin.Login);
Router.get("/consignee/verify",adminAuth,Admin.GetConsignee);
Router.get("/transporter/verify",adminAuth,Admin.GetTransporter);
Router.post("/consignee/verify",adminAuth,Admin.VerifyConsignee);
Router.post("/transporter/verify",adminAuth,Admin.VerifyTransporter);

module.exports = Router;
