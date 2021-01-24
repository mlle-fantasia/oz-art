var express = require("express");
const mongoose = require("mongoose");
var path = require("path");
// import { v4 as uuid } from "uuid";
const uuid = require("uuid");
var cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
var logger = require("morgan");
const fs = require("fs-extra");
const mustache = require("mustache");
var mustacheExpress = require("mustache-express");
var bodyParser = require("body-parser");
const cors = require("cors");
const User = require("./schema/userSchema.js");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var session = require("express-session");
global.Services = require("./utils/Services");

const app = express();

app.engine("mustache", mustacheExpress());

app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public")); // set static folder

app.use(logger("dev"));

var corsOptions = {
	// origin: "http://telinko.ecaste.com", // PROD
	// origin: "http://localhost:8080", // DEV
	origin: true,
	methods: "GET,PUT,POST,DELETE,OPTIONS",
	allowedHeaders:
		"Content-Type, Authorization, Credentials, X-Requested-With, Accept, Content-Length, x-auth-apikey, x-auth-apisecret, x-auth-accesstoken, x-auth-refreshtoken, x-auth-webaccesstoken, x-auth-webrefreshtoken",
	credentials: true,
	optionsSuccessStatus: 200,
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

var sess = {
	genId: function (req) {
		return uuid.v4();
	},
	secret: process.env.SESSION_KEY,
	name: "session",
	resave: false,
	/* saveUninitialized: false, */
	cookie: {
		maxAge: 36000000000, // une heure de session
		secure: false,
		httpOnly: false,
	},
};
/* if (app.get("env") === "production") {
	app.set("trust proxy", 1); // trust first proxy
	sess.cookie.secure = true; // serve secure cookies
} */
app.use(session(sess));

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload({ abortOnLimit: true, responseOnLimit: "File size limit has been reached" }));
/* app.use(express.json());
app.use(express.urlencoded({ extended: false })); */
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
fs.ensureDirSync("./uploads");
app.use(express.static(path.join(__dirname, "uploads")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// on ajoute les controllers
fs.readdirSync("controllers").forEach((file) => {
	let route = require("./controllers/" + file);
	route.controller(app);
});

module.exports = app;

mongoose.connect(
	"mongodb+srv://mArina_oz:" +
		process.env.DATABASE_PASSWORD +
		"@clusteroz.nflwf.mongodb.net/" +
		process.env.DATABASE_NAME +
		"?retryWrites=true&w=majority",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	}
);
