const jwt = require('jsonwebtoken');
const key = "lightning"
const JWTsign = (id)=>{
    const payload = {subject:id};
    const token = jwt.sign(payload,key,{expiresIn: '12h'});
    return token;
}
const JWTverify = (token)=>{
    const payload = jwt.verify(token,key,(err,decoded)=>{
        if(err)
        {
            console.log(err)
        }
    });
    return payload
}
module.exports = {
    JWTsign,
    JWTverify
}