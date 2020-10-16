var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mustache = require("mustache");
var mustacheExpress = require("mustache-express");
var bodyParser = require("body-parser");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.engine("mustache", mustacheExpress());

app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public")); // set static folder

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
