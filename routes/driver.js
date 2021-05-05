const express = require("express");
const { Driver } = require("../controller/index");
const { Auth } = require('../packages/middleware/authindex');
const Router = express.Router();

Router.post("/login", Driver.Login);
Router.get("/getOrders",Auth, Driver.GetOrder);
Router.post("/updateStatus",Auth,Driver.UpdateStatus);
module.exports = Router;
