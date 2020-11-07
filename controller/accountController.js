const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const mongoose = require("mongoose");
const userSchema = require("../schema/userSchema.js");
const User = mongoose.model("user", userSchema, "user");

module.exports.controller = (app) => {
	app.post("/createaccount/step1", async function (req, res) {
		let hash = bcrypt.hashSync(req.body.password1, salt);
		let newUser = new User();
		console.log("req.body", req.body);
		newUser.email = req.body.email;
		newUser.type = req.body.type;
		newUser.password = hash;

		newUser
			.save()
			.then(() => {
				if (newUser.type === "seller") res.redirect("/login/register/seller/step2");
				if (newUser.type === "buyer") res.redirect("/login/register/buyer/step2");
			})
			.catch((err) => {
				console.log("erreur : ", err);
				res.redirect("/login/register?error=email_not_valid");
			});
	});

	app.put("/createaccount/step2/buyer", async function (req, res) {
		let user = await User.findOne({ name: "front" });
		user.shop = {
			name: req.body.name,
		};
		let response = await User.update({ _id: user._id }, user);
		console.log("ok", response);
	});

	app.put("/createaccount/step2/seller", async function (req, res) {
		let user = await User.findOne({ name: "front" });
		user.shop = {
			name: req.body.name,
		};
		let response = await User.update({ _id: user._id }, user);
		console.log("ok", response);
	});
};
