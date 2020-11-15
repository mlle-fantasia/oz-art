const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
var jwt = require("jsonwebtoken");

module.exports.controller = (app) => {
	app.get("/users", async function (req, res) {});

	app.get("/users/:id", async function (req, res) {
		let user = await userSchema.findOne({ _id: req.params.id }).exec();
		console.log("user in userController", user);
		res.send({ data: user });
	});

	app.put("/users/:id", async function (req, res) {});
};
