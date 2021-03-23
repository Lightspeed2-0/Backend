const mongoose = require("mongoose");
const { consignee_login } = require("../model/index");
const {JWTsign} = require('../packages/auth/tokenize')
mongoose.connect(
  "mongodb+srv://jayasurya:123@development.cdhc7.mongodb.net/test",
  { useUnifiedTopology: true, useNewUrlParser: true }
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("mongodb connected!");
});

class Consignee {
  static async Login(req, res) {
    try {
      const body = req.body;
      consignee_login.findOne({ Email: body.Email }, (err, consignee) => {
        if (err) {
          console.log(err);
        }
        console.log(consignee);
        if (!consignee) {
          res.status(401).send("Invalid Email Id");
        } else if (body.Password !== consignee.Password) {
          res.status(401).send("Invalid Password");
        } else {
          const token = JWTsign(consignee._id);
          res.send({ token });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  static async Register(req, res) {
    try {
      const consignee = new consignee_login(req.body);
      consignee.save((error, consignee) => {
        if (error) {
          return res.status(500).send("Invalid");
        } else {
          const token = JWTsign(consignee._id);
          res.send({ token });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = Consignee;
