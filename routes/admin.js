const express = require("express");
const { Admin } = require("../controller/index");
const Router = express.Router();

Router.post("/login", Admin.Login);
Router.get("/consignee/verify",Admin.GetConsignee);
Router.get("/transporter/verify",Admin.GetTransporter);
Router.post("/consignee/verify",Admin.VerifyConsignee);
Router.post("/transporter/verify",Admin.VerifyTransporter);

module.exports = Router;
