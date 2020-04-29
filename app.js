require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const FacebookStrategy = require("passport-facebook");

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
  secret: process.env.SECRET,  //use .env to store secret
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
  username: { type: String, index: false },
  password: String,
  googleId: String,
  facebookId: String,
  secret: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

/* declare a secretKey, and use this key to encrypt certain field in DB, in this case, 
using it to encrypt "password" field. after this is done, no other action is required 
to ensure the encryption of password entered.
*/

// We will be using hashing in this level instead of encryption module.
// userSchema.plugin(encrypt, { secret: process.env.SECRETKEY, encryptedFields: ["password"] });


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user)
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile)
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/secrets",
      profileFields: ["id", "displayName","email"]
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(profile.id)
      User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

app.get("/", (req, res) => {
  res.render("home")
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to secrets page.
    res.redirect('/secrets');
  });

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

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

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated) {
    User.find({ "secret": { $ne: null } }, (err, foundUsers) => {
      if (err) {
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("secrets",{usersWithSecrets: foundUsers});
        }
      }
    })
    
    
  }
  else {
    res.redirect("login");
  }
});

app.get("/submit", (req,res) => {
  if (req.isAuthenticated) {
    res.render("submit");
  } else {
    res.redirect("login");
  }
});

app.post("/submit", (req, res) => {
  const submittedSecret = req.body.secret;
  const userId = req.user.id;

  console.log(submittedSecret);
  console.log(req.user); 


  User.findById(userId, (err, foundUser) => {
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function () {
          res.redirect("/secrets");
        
        });
      }
    }
  });
});

app.post("/register", (req, res) => {

  // passport-local-mongoose package method
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        // use passport authenticate method
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
  
});

// app.post("/login",  (req, res, next)=> {
//   passport.authenticate("local",  (err, user, info)=>{
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.redirect("/login");
//     }
//     req.logIn(user, (err)=> {
//       if (err) {
//         return next(err);
//       }
//       return res.redirect("/secrets");
//     });
//   })(req,res,next)
// });


app.post("/login", (req, res) => {
  
  const user = new User({
    email: req.body.username,
    password: req.body.password,
  });

  // use passport module's login() function
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", { failureFlash: true })(req, res, () => {
        res.redirect("/secrets");
      });
    }
  })
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
