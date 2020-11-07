var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mustache = require("mustache");
var mustacheExpress = require("mustache-express");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userSchema = require("./schema/userSchema.js");
const User = mongoose.model("user", userSchema, "user");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

const app = express();

app.engine("mustache", mustacheExpress());

app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public")); // set static folder

app.use(logger("dev"));

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
/* app.use(express.json());
app.use(express.urlencoded({ extended: false })); */
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

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
userMarina();

/**
 * on verifie si l'utilisateur marina existe si non on le créer
 */
async function userMarina() {
	/* let user = await User.findOne({ name: "front" });
	if (!user) {
		user = new User({
			name: "front",
			firstname: "marina",
			email: "marinafront@hotmail.fr",
			created: Date.now(),
		}).save();
	} */
}

// on ajoute les controllers
var route = require("./controller/accountController.js");
route.controller(app);
