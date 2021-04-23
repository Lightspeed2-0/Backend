const jwt = require('jsonwebtoken');
const key = "lightning"
const JWTsign = (id)=>{
    const payload = {subject:id};
    const token = jwt.sign(payload,key);
    return token;
}
const JWTverify = (token)=>{
    const payload = jwt.verify(token,key);
    return payload
}
module.exports = {
    JWTsign,
    JWTverify
}