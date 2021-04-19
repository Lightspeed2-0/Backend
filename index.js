const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const routes = require("./routes/index");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static("./public"));
app.use(
  session({
    secret: "why_so_serious",
    resave: true,
    saveUninitialized: true,
  })
);
//db connection
mongoose.connect(
  "mongodb+srv://jayasurya:123@development.cdhc7.mongodb.net/staging",
  { useUnifiedTopology: true, useNewUrlParser: true }
);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("mongodb connected!");
});

app.get('/',(req,res)=>{
  res.send("OK");
})
app.use("/", routes);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server Up : Running on PORT no:${PORT}`);
  }
});
