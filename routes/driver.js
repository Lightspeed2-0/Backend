const express = require("express");
const { Driver } = require("../controller/index");
const { Auth } = require('../packages/middleware/authindex');
const Router = express.Router();

Router.post("/login", Driver.Login);
module.exports = Router;
