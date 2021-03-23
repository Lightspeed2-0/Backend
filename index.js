const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./routes/index')
const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost:27017/lightspeed',{ useUnifiedTopology: true , useNewUrlParser: true });

app.use(cors());
app.use(bodyParser.json());

app.use('/',routes)
app.listen(PORT,err =>{
    if(err){
        console.log(err);
    }else{
        console.log(`Server Up : Running on PORT no:${PORT}`);
    }
})