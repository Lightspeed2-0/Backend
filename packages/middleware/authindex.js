const {adminAuth} = require("./adminauth");
let jwt = require('jsonwebtoken');

let Auth = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    if (token) {
      jwt.verify(token, "lightning", (err, decoded) => {
        if (err) {
          return res.status(403).send({
            msg: 'Token is not valid'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(403).send({
          msg: 'Token is not valid'
        });
    }
  };

module.exports={
    adminAuth,
    Auth
}