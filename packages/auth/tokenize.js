const jwt = require('jsonwebtoken');
const key = "lightning"
const JWTsign = (id)=>{
    const payload = {subject:id};
    const token = jwt.sign(payload,key);
    return token;
}

module.exports = {
    JWTsign
}