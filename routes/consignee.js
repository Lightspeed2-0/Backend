const express = require("express");
const { Consignee } = require("../controller/index");
const Router = express.Router();
Router.post("/login", Consignee.Login);
Router.post("/register", Consignee.Register);
Router.post("/verify", Consignee.Verify);

module.exports = Router;
