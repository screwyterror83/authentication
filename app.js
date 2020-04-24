const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

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

const User = mongoose.model("User", userSchema);



app.get("/", (req, res) => {
  res.render("home")
});

app.get("/login", (req, res) => {
  res.render("login");
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
          email: req.body.username,
          password: req.body.password,
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
  const password = req.body.password;

  User.findOne({ email: userName }, (err, foundUser) => {
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          console.log("Log in successful, please proceed.");
          res.render("secrets");
        } else {
          res.send("Log in failed.");
          res.render("home");  
        }
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
