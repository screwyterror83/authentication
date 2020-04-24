const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));






let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000
};

app.listen(port, (err) => {
  if (!err) {
    console.log("Server started on port " + port)
  }
});
