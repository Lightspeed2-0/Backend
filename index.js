const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost:27017/lightspeed',{ useUnifiedTopology: true , useNewUrlParser: true });

const routes = require('./routes/index')
app.use(bodyParser.json());
// app.get('/login',(req,res)=>{
//     return res.send("Hello")
// })
app.use('/',routes)
app.listen(PORT,err =>{
    if(err){
        console.log(err);
    }else{
        console.log(`Server Up : Running on PORT no:${PORT}`);
    }
})