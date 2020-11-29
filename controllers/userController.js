const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
var jwt = require("jsonwebtoken");
const path = require("path");
var glob = require("glob");

module.exports.controller = (app) => {
	app.get("/users", async function (req, res) {});

	app.get("/users/:id", async function (req, res) {
		let user = await User.findOne({ _id: req.params.id }).exec();
		console.log("user in userController", user);
		res.send({ data: user });
	});

	app.post("/users/edit/avatar/:id", async function (req, res) {
		let userSaved = Services.saveAvatar(req.body, req.files, req.params.id);
		if (!userSaved) return res.status(500).send(err);
		else {
			req.session.user = userSaved;
			res.redirect("/profil");
		}
	});

	app.post("/users/edit/:id", async function (req, res) {
		console.log("req.body", req.body);
		const data = { ...req.body };
		const user = await User.update({ _id: req.params.id }, data);
		res.redirect("/profil");
	});
};
