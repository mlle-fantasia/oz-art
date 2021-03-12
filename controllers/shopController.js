const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");
const Product = require("../schema/productSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
const path = require("path");
var jwt = require("jsonwebtoken");
var glob = require("glob");

module.exports.controller = (app) => {
	//// routes du site
	app.get("/site/shops", async function (req, res) {
		let shops = await Shop.find().exec();
		res.send({ shops });
	});

	app.get("/site/shops/:slug", async function (req, res) {
		let shop = await Shop.findOne({ slug: req.params.slug }).populate("products").exec();
		if (!shop) return res.send({ err: "not_found", errtxt: "la boutique n'existe pas" });

		//console.log("shop", shop);
		res.send({ shop });
	});

	app.post("/site/shops/addlike", async function (req, res) {
		console.log("shops/addlike , body", req.body);
		//let actions = ["addlike"];
		// on récupère la boutique
		let shop = await Shop.findOne({ _id: req.body.shopId }).exec();
		// on vérifie l'utilisateur
		let decoded;
		try {
			decoded = jwt.verify(req.body.userToken, process.env.TOKEN_KEY);
		} catch (error) {
			// pas de token ou token faux
			console.log("catch erreur", error);
			res.redirect(process.env.URL_SITE + "/boutique/" + shop.slug + "?success=false&action=addlike");
			return;
		}
		console.log("decoded", decoded);
		let user = await User.findOne({ _id: decoded.id });
		if (shop && user) {
			// on verifie si l'utilisateur aime déjà et si non in l'ajoute.
			let alreadyAdmirer = false;
			for (let i = 0; i < shop.admirers.length; i++) {
				const admirer = shop.admirers[i];
				if (user._id === admirer) {
					alreadyAdmirer = true;
					break;
				}
			}
			if (!alreadyAdmirer) await Shop.updateOne({ _id: shop._id }, { $push: { admirers: user._id } });

			let alreadyFollower = false;
			for (let i = 0; i < shop.followers.length; i++) {
				const follower = shop.followers[i];
				if (user._id === follower) {
					alreadyFollower = true;
					break;
				}
			}
			if (!alreadyFollower) await Shop.updateOne({ _id: shop._id }, { $push: { followers: user._id } });

			let alreadyFavorite = false;
			for (let i = 0; i < user.favorite_shop.length; i++) {
				const favorite = user.favorite_shop[i];
				if (user._id === favorite) {
					alreadyFavorite = true;
					break;
				}
			}
			if (!alreadyFavorite) await User.updateOne({ _id: user._id }, { $push: { favorite_shop: shop._id } });
		}

		res.redirect(process.env.URL_SITE + "/boutique/" + shop.slug + "?success=true&action=addlike");
	});

	//// routes de l'espace admin
	app.get("/admin/shops/:id", Services.accessCHECK, async function (req, res) {
		let shop = await Shop.findOne({ _id: req.params.id }).exec();
		if (!shop) return res.send({ err: "not_found", errtxt: "la boutique n'existe pas" });
		//todo vérifier si c'est bien la boutique de la personne qui demande
		res.send({ shop });
	});

	// pour affichers les chiffres sur le tableau de bord
	app.get("/admin/shops/:id/stats", Services.accessCHECK, async function (req, res) {
		let shop = await Shop.findOne({ _id: req.params.id }).exec();
		if (!shop) return res.send({ err: "not_found", errtxt: "la boutique n'existe pas" });
		//todo vérifier si c'est bien la boutique de la personne qui demande
		let stats = { admirers: shop.admirers.length, followers: shop.followers.length };
		res.send({ stats });
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

	app.post("/admin/shops/:id/images/:imgtype", Services.accessCHECK, async function (req, res) {
		let shop = await Shop.findOne({ _id: req.params.id });
		if (!shop) return res.send({ err: "shop_not_found", errtxt: "boutique non trouvée" });

		let pathImageToSave = "";
		fs.ensureDirSync("./uploads/shops");
		fs.ensureDirSync("./uploads/shops/" + shop._id);

		if (req.files && req.files.image) {
			// suprimer le image existante s'il y en a
			let pathImage = "./uploads/shops/" + shop._id + "/" + req.params.imgtype;
			let filesToDelete = glob.sync(pathImage + ".*", {});
			if (filesToDelete && filesToDelete.length) {
				for (let i = 0; i < filesToDelete.length; i++) {
					const file = filesToDelete[i];
					fs.unlinkSync(file);
				}
			}
			// on crée le fichier dans uploads
			let f = path.basename(req.files.image.name);
			let ext = path.extname(f).toLowerCase();
			pathImage += ext;
			req.files.image.mv(pathImage, async function (err) {
				if (err) return res.send({ err: "image_not_save", errtxt: "erreur lors de l'enregistrement de l'image" });
				else {
					pathImageToSave = "/shops/" + shop._id + "/" + req.params.imgtype + ext;
					await Shop.updateOne({ _id: shop._id }, { ["img_" + req.params.imgtype]: pathImageToSave });
					return res.send({ success: "post_shopsimages_success" });
				}
			});
		} else {
			res.send({ err: "image_not_save", errtxt: "pas d'image envoyé" });
		}
	});

	app.post("/admin/shops/edit/:id", Services.accessCHECK, async function (req, res) {
		const data = { ...req.body };
		await Shop.update({ _id: req.params.id }, data);
		res.send({ success: "shop_updated" });
		//res.redirect("/profil");
	});
};
