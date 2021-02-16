const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
var jwt = require("jsonwebtoken");
const mustache = require("mustache");
const uuid = require("uuid");
const path = require("path");
var glob = require("glob");
var slug = require("slug");

const includeMail = {
	header: fs.readFileSync("viewsemail/headerMail.html", "utf8"),
	footer: fs.readFileSync("viewsemail/footerMail.html", "utf8"),
};

/**
 * vérifie le token passé dans la request.
 * verifie que l'utilisateur existe
 * middleware appelé sur toute les routes qui nécessitent une authentification
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
/* async function authMiddleware(request, response, next) {
	console.log("je passe");
	try {
		let decoded = jwt.verify(req.query.user, process.env.TOKEN_KEY);
		let user = await User.findOne({ _id: decoded.id });
		console.log("user", user);
		if (user) {
			next(user);
		} else {
			response.status(401).send();
		}
	} catch (error) {
		response.status(401).send();
	}
} */

module.exports.controller = (app) => {
	/**
	 * est appelé par le frontend si le token n'est pas valide.
	 * attend dans req.body.refreshtoken le refreshtoken.
	 * vérifie le refreshtoken,  s'il est ok, créer de nouveaux token et refreshtoken et les envoie
	 */
	app.post("/admin/refreshtoken", async function (req, res) {
		console.log("coucou dans admin/refreshtoken", req.body.refreshtoken);
		let decoded = {};
		try {
			decoded = jwt.verify(req.body.refreshtoken, process.env.TOKEN_KEY);
		} catch (error) {
			console.log("erreur", error);
			return res.send({ err: "refreshtoken_expired", errtxt: "refreshtoken expiré" });
		}
		let user = await User.findOne({ _id: decoded.id });
		if (!user) return res.send({ err: "user_not_found", errtxt: "utilisateur non trouvé" });
		var token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user._id }, process.env.TOKEN_KEY);
		var refreshtoken = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 600 * 600, id: user._id }, process.env.TOKEN_KEY);
		res.send({ success: "connexion_ok", data: { token, user, refreshtoken } });
	});

	/**
	 * création de l'utilisateur plus envoie du mail de confirmation de l'email
	 * qui contient un lien pour poursuivre l'inscription
	 */
	app.post("/createaccount/step1", async function (req, res) {
		console.log("req.body", req.body);
		let hash = bcrypt.hashSync(req.body.password, salt);
		let newUser = new User();
		newUser.type = req.body.type;
		newUser.right = req.body.email === process.env.EMAIL_SUPERADMIN ? "SUPER_ADMIN" : "";
		newUser.email = req.body.email;
		newUser.password = hash;

		newUser
			.save()
			.then(() => {
				let token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.TOKEN_KEY);
				let obj = {
					emailLink: process.env.URL_ADMIN + "/createaccount/" + newUser.type + "/step2?token=" + token,
				};
				let html = fs.readFileSync("viewsemail/mailCreateaccount.html", "utf8");
				let email = mustache.render(html, obj, includeMail);
				const request = mailjet.post("send", { version: "v3.1" }).request({
					Messages: [
						{
							From: {
								Email: "marinafront@hotmail.fr",
								Name: "oz-art",
							},
							To: [
								{
									Email: newUser.email,
									Name: "",
								},
							],
							Subject: "Bienvenue",
							TextPart: "",
							HTMLPart: email,
							CustomID: "AppGettingStartedTest",
						},
					],
				});
				request
					.then((result) => {
						res.send({ success: "email_inscription_envoye", successtxt: "email d'inscription envoyé" });
					})
					.catch((err) => {
						console.log(err.statusCode);
						res.send({ err: "user_not_found", errtxt: "Nous sommes désolé, une erreur est survenue" });
					});
			})
			.catch((err) => {
				console.log("erreur : ", err);
				res.send({ err: "email_not_valid", errtxt: "L'email existe déjà ou n'est pas valide" });
			});
	});

	/**
	 * Route appelée depuis le lien dans l'email entre l'étape 1 et 2
	 * si le token est ok renvoie vers l'étape 2
	 */
	app.post("/createaccount/step2/buyerandseller", async function (req, res) {
		let decoded = jwt.verify(req.body.token, process.env.TOKEN_KEY);
		let user = await User.findOne({ _id: decoded.id });
		console.log("decoded", decoded);
		var token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user._id }, process.env.TOKEN_KEY);
		var refreshtoken = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 600 * 600, id: user._id }, process.env.TOKEN_KEY);
		console.log("user dans buyerandseller", user);
		if (user) {
			res.send({ success: "connexion_ok", data: { token, user, refreshtoken } });
		} else {
			res.send({ err: "user_not_found", errtxt: "Nous sommes désolé, une erreur est survenue" });
		}
	});

	/**
	 * mise à jour de l'utilisateur lors de l'étape deux d'un acheteur
	 *
	 */
	app.post("/createaccount/step2/buyer", Services.accessCHECK, async function (req, res) {
		console.log("req.user", req.user);
		const data = { ...req.body };
		// création de l'avatar
		let response = {};
		console.log("data.avatardefault", data.avatardefault);
		if (data.avatardefault) {
			response = await Services.saveAvatarDefault(data.avatardefault);
		} /* else if (req.files && req.files.avatarfile) {
			response = await Services.saveAvatar(req.files, req.user._id);
		} */
		console.log("response", response);
		if (response.erreur) res.status(500).send(response.erreur);
		// mise à jour de l'utilisateur
		data.avatar = response.pathAvatar;
		await User.updateOne({ _id: req.user._id }, data);
		console.log("end");
		res.send({ success: "user_edit_ok", data: {} });
	});

	/**
	 * mise à jour de l'utilisateur lors de l'étape deux d'un acheteur
	 */
	app.post("/createaccount/step2/avatar", Services.accessCHECK, async function (req, res) {
		console.log("req.files", req.files);
		let response = await Services.saveAvatar(req.files, req.user._id);
		if (response.erreur) res.status(500).send(response.erreur);
		await User.updateOne({ _id: req.user._id }, { avatar: response.pathAvatar });

		res.send({ success: "user_edit_ok", data: {} });
	});

	app.post("/createaccount/step2/seller", Services.accessCHECK, async function (req, res) {
		console.log("req.user", req.user);
		let user = await User.findOne({ _id: req.user.id });
		if (!user) return res.send({ err: "user_not_found", errtxt: "erruer lors de la création du compte" });
		const data = { ...req.body };
		// création de l'avatar
		let pathAvatar = "";
		let response = {};
		if (req.files && req.files.avatar) {
			response = await Services.saveAvatar(req.files, user._id);
		}
		if (response.erreur) res.status(500).send(response.erreur);
		pathAvatar = response.pathAvatar;

		// création de la boutique avec l'id du user
		let newShop = new Shop();
		newShop.name = req.body.shop_name;
		newShop.slug = slug(req.body.shop_name);
		newShop.address1 = req.body.shop_address1;
		newShop.address2 = req.body.shop_address2;
		newShop.zip = req.body.shop_zip;
		newShop.city = req.body.shop_city;
		newShop.user = user._id;
		newShop.avatar = pathAvatar;

		let shopSaved = await newShop.save();

		// on récupère l'id de la boutique et on met à jour le user et son avatar
		data.shop = shopSaved._id;
		data.avatar = pathAvatar;
		await User.updateOne({ _id: user._id }, data);
		res.send({ success: "user_edit_ok", data: {} });
	});

	/**
	 * login
	 * vérifie si l'utilisateur exite avec cette adresse mail, vérifie le mot de passe
	 * si c'est ok, créer un token et un refreshtoken et les envoie
	 */
	app.post("/admin/login", async function (req, res) {
		let user = await User.findOne({ email: req.body.email });
		if (!user) return res.send({ err: "user_not_found", errtxt: "erreur de connexion" });
		console.log("user dans admin/login", user);
		let hash = user.password;
		const match = await bcrypt.compare(req.body.password, hash);
		if (match) {
			//req.session.user = user;
			//var token = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user._id }, process.env.TOKEN_KEY);
			//var refreshtoken = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 600 * 600, id: user._id }, process.env.TOKEN_KEY);
			var token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, { expiresIn: 60 * 60 });
			var refreshtoken = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, { expiresIn: 600 * 600 });
			res.send({ success: "connexion_ok", data: { token, user, refreshtoken } });
		} else {
			res.send({ err: "user_not_found", errtxt: "mot de passe ou email incorrecte" });
		}
	});

	/**
	 * login
	 * vérifie si l'utilisateur exite avec cette adresse mail, vérifie le mot de passe
	 * si c'est ok, créer un token et un refreshtoken et les envoie
	 */
	app.post("/admin/autologin", Services.accessCHECK, async function (req, res) {
		console.log("admin/autologin");
		/* let decoded = {};
		try {
			decoded = jwt.verify(req.body.token, process.env.TOKEN_KEY);
		} catch (error) {
			return res.status(401).send();
		}
		let user = await User.findOne({ _id: decoded.id });
		if (!user) return res.send({ err: "user_not_found", errtxt: "utilisateur non trouvé" }); */

		res.send({ success: "connexion_ok", data: req.user });
	});

	/**
	 * supprime le compte d'un utilisateur avec
	 * - son avatar,
	 * - la booutique s'il en a une,
	 * - les produits de la boutique,
	 * - et les images de la boutique et des produits
	 */
	app.delete("/admin/users/delete/:id", Services.accessCHECK, async function (req, res) {
		let user = await User.findOne({ _id: req.params.id });
		//suprimer l'avatar du user
		let pathAvatar = "./uploads/avatars/" + req.params.id;
		let files = glob.sync(pathAvatar + ".*", {});
		if (files && files.length) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				fs.unlinkSync(file);
			}
		}
		// si c'est user type === seller
		// supprimer la boutique
		if (user.type == "seller") {
			let shop = await Shop.findOne({ _id: user.shop });
			await shop.deleteOne();
			// supprimer les images de la boutique et les produits
		}

		// supprimer le user
		await user.deleteOne();
		res.redirect("/");
	});
};
