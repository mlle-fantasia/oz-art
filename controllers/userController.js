const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
var jwt = require("jsonwebtoken");
const path = require("path");
var glob = require("glob");

module.exports.controller = (app) => {
	app.get("/users", async function (req, res) {
		res.send({ success: "user_get_ok" });
	});

	app.get("/users/:id", Services.accessCHECK, async function (req, res) {
		let user = await User.findOne({ _id: req.params.id }).exec();
		if (!user) return res.send({ err: "user_not_found", errtxt: "utilisateur non trouvé" });
		res.send({ success: "user_get_ok", data: user });
	});

	app.post("/users/edit/avatar/:id", Services.accessCHECK, async function (req, res) {
		let user = await User.findOne({ _id: req.params.id });
		if (!user) return res.send({ err: "user_not_found", errtxt: "erreur lors de l'enregistrement de l'avatar" });
		const avatardefault = req.body.avatardefault;
		let pathAvatar = "";
		let response = {};
		console.log("req.files", req.files);
		if (avatardefault) {
			response = await Services.saveAvatarDefault(avatardefault);
		} else if (req.files && req.files.avatarfile) {
			response = await Services.saveAvatar(req.files, user._id);
		}
		if (response.erreur) res.status(500).send(response.erreur);
		pathAvatar = response.pathAvatar;
		console.log("pathAvatar", pathAvatar);
		// on met à jour juste le user.avatar
		await User.updateOne({ _id: user._id }, { avatar: pathAvatar });
		// si c'est un vendeur, on met à jour aussi shop.avatar
		if (user.type === "seller") await Shop.updateOne({ _id: user.shop }, { avatar: pathAvatar });

		res.send({ success: "user_get_ok", data: user });
	});

	app.put("/users/edit/:id", Services.accessCHECK, async function (req, res) {
		const data = { ...req.body };
		/* let user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(401).send(); */

		await User.updateOne({ _id: req.params.id }, data);

		let user = await User.findOne({ _id: req.params.id });

		res.send({ success: "user_edit_ok", data: { user } });
	});
};
