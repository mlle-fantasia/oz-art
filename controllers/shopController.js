const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
const path = require("path");
var glob = require("glob");

module.exports.controller = (app) => {
	//// routes du site
	app.get("/site/shops", async function (req, res) {
		let shops = await Shop.find().exec();
		res.send({ shops });
	});

	app.get("/site/shops/:slug", async function (req, res) {
		let shop = await Shop.findOne({ slug: req.params.slug }).exec();
		if (!shop) return res.send({ err: "not_found", errtxt: "la boutique n'existe pas" });
		console.log("shop", shop);
		res.send({ shop });
	});

	//// routes de l'espace admin
	app.get("/admin/shops/:id", Services.accessCHECK, async function (req, res) {
		let shop = await Shop.findOne({ _id: req.params.id }).exec();
		if (!shop) return res.send({ err: "not_found", errtxt: "la boutique n'existe pas" });
		//todo vérifier si c'est bien la boutique de la personne qui demande
		res.send({ shop });
	});

	app.put("/admin/shops/:id", Services.accessCHECK, async function (req, res) {
		const data = { ...req.body };
		console.log("data", data);
		await Shop.updateOne({ _id: req.params.id }, data);
		// si c'est un vendeur, on met à jour aussi shop.email
		if (req.user.type === "seller") await User.updateOne({ _id: data.user }, { email: data.email });

		let shop = await Shop.findOne({ _id: req.params.id });
		res.send({ success: "shop_edit_ok", data: { shop } });
	});

	/* app.post("/shops/edit/avatar/:id", async function (req, res) {
		let user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(401).send();
		const avatardefault = req.body.avatardefault;
		let pathAvatar = "";
		let response = {};
		if (avatardefault) {
			response = await Services.saveAvatarDefault(avatardefault);
		} else if (req.files && req.files.avatar) {
			response = await Services.saveAvatar(req.files, user._id);
		}
		if (response.erreur) res.status(500).send(response.erreur);
		pathAvatar = response.pathAvatar;

		// on met à jour juste le user.avatar
		let userSaved = await User.updateOne({ _id: user._id }, { avatar: pathAvatar });
		// si c'est un vendeur, on met à jour aussi shop.avatar
		if (user.type === "seller") {
			await Shop.updateOne({ _id: user.shop }, { avatar: pathAvatar });
			res.redirect("/profil/shop");
		} else {
			res.redirect("/profil");
		}
	}); */

	app.post("/admin/shops/edit/:id", Services.accessCHECK, async function (req, res) {
		const data = { ...req.body };
		await Shop.update({ _id: req.params.id }, data);
		res.send({ success: "shop_updated" });
		//res.redirect("/profil");
	});
};
