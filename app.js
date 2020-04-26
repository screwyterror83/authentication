require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

/* install and declare mongoose encryption module so it enables encryption capability. */
// const encrypt = require("mongoose-encryption");
// use hashing instead of mongoose-encryption
// const md5 = require("md5")

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(session({
  secret: "This is a secret no one should know.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


const dbName = "userDB"
mongoose.connect(
  "mongodb+srv://admin-darren:Mongodb382%23@cluster0-gmncq.mongodb.net/" +
  dbName, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

/* declare a secretKey, and use this key to encrypt certain field in DB, in this case, 
using it to encrypt "password" field. after this is done, no other action is required 
to ensure the encryption of password entered.
*/

// We will be using hashing in this level instead of encryption module.
// userSchema.plugin(encrypt, { secret: process.env.SECRETKEY, encryptedFields: ["password"] });


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
  res.render("home")
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req,res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  }
  else {
    res.redirect("login");
  }
})

app.post("/register", (req, res) => {

  // passport-local-mongoose package method
  User.register({ username: req.body.username }, req.body.password, (err, user) => {
    if (err) {
      res.write(err.message);
      res.redirect("/register");
      
    } else {
      // use passport authenticate method
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  })
  
});

app.post("/login",  (req, res, next)=> {
  passport.authenticate("local",  (err, user, info)=>{
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, (err)=> {
      if (err) {
        return next(err);
      }
      return res.redirect("/secrets");
    });
  })(req,res,next)
});


// app.post("/login", (req, res) => {
  
  // const user = new User({
  //   username: req.body.username,
  //   password: req.body.password
  // });

//   // use passport module's login() function
//   req.login(user, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate("local", { failureFlash: true })(req, res, () => {
//         res.redirect("/secrets");
//       });
//     }
//   })
// });



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
};

app.listen(port, (err) => {
  if (!err) {
    console.log("Server started on port " + port)
  }
});
