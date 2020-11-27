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
		let uploadPath = "./uploads/avatars";
		if (req.files || req.body.avatardefault) {
			// suprimer les avatar existant s'il y en a
			let pathAvatar = uploadPath + "/" + req.params.id;
			let files = glob.sync(pathAvatar + ".*", {});
			console.log("files", files);
			if (files && files.length) {
				for (let i = 0; i < files.length; i++) {
					const file = files[i];
					fs.unlinkSync(file);
				}
			}
			if (req.files && req.files.avatar) {
				console.log("req.files", req.files);
				let f = path.basename(req.files.avatar.name);
				let ext = path.extname(f).toLowerCase();
				pathAvatar += ext;
				req.files.avatar.mv(pathAvatar, async function (err) {
					if (err) return res.status(500).send(err);
					const data = { ...req.body, avatar: "/avatars/" + req.params.id + ext };
					console.log("data1", data);
					const user = await User.update({ _id: req.params.id }, data);
					res.redirect("/profil");
				});
			}
			if (req.body.avatardefault) {
				console.log("req.body.avatardefault", req.body.avatardefault);
				let defaultAvatarSelected = "./public/images/avatars-default/" + req.body.avatardefault;
				let defaultAvatarSelectedDest = "./uploads/avatars/" + req.body.avatardefault;
				//s'il existe déjà on enregistre juste dans user
				if (!fs.existsSync(defaultAvatarSelectedDest)) {
					await fs.copySync(defaultAvatarSelected, defaultAvatarSelectedDest);
				}
				const data = { ...req.body, avatar: "/avatars/" + req.body.avatardefault };
				console.log("data2", data);
				const user = await User.update({ _id: req.params.id }, data);
				res.redirect("/profil");
			}
		} else {
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
