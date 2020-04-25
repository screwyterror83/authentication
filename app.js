require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
/* install and declare mongoose encryption module so it enables encryption capability. */
// const encrypt = require("mongoose-encryption");
// use hashing instead of mongoose-encryption
const md5 = require("md5")

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


const dbName = "userDB"
mongoose.connect(
  "mongodb+srv://admin-darren:Mongodb382%23@cluster0-gmncq.mongodb.net/" +
    dbName,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  }
);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});


/* declare a secretKey, and use this key to encrypt certain field in DB, in this case, 
using it to encrypt "password" field. after this is done, no other action is required 
to ensure the encryption of password entered.
*/

// We will be using hashing in this level instead of encryption module.
// userSchema.plugin(encrypt, { secret: process.env.SECRETKEY, encryptedFields: ["password"] });


const User = mongoose.model("User", userSchema);



app.get("/", (req, res) => {
  res.render("home")
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {

  const userName = req.body.username;
  const password = req.body.password;

  User.findOne({ email: userName }, (err, foundUser) => {
    if (!foundUser) {
      const newUser = new User(
        {
          email: userName,
          password: md5(password)
        });

      newUser.save((err) => {
        if (!err) {
          res.render("secrets")
        } else {
          console.log(err)
        };
      })
    } else {
      res.redirect("/login")
    }
  })
});

app.post("/login", (req,res) => {
  const userName = req.body.username;
  const password = md5(req.body.password);

  User.findOne({ email: userName }, (err, foundUser) => {
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          console.log("Log in successful, please proceed.");
          res.render("secrets");
        } else {
          console.log("Log in failed.");
          res.render("home");  
        }
      } else {
        console.log("No such User")
        res.render("home");
      }
    }
  });
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
};

app.listen(port, (err) => {
  if (!err) {
    console.log("Server started on port " + port)
  }
});
