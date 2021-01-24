var express = require("express");
var router = express.Router();
const mustache = require("mustache"); // moteur de template
const fs = require("fs-extra"); // sert à aller chercher les fichiers html
var jwt = require("jsonwebtoken");
const User = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");

// les éléments a ajouter sur toutes les pages minimum head et footer qui contienne le début et la fin de la balise body.
// le header contient le champs recherche et la navigation
const include = {
	head: fs.readFileSync("views/layout/head.html", "utf8"),
	header: fs.readFileSync("views/layout/header.html", "utf8"),
	footer: fs.readFileSync("views/layout/footer.html", "utf8"),
};

// tableau des erreurs
const errors = [
	{ value: "email_not_valid", text: "Email déjà existant ou non valide" },
	{ value: "erreur_survenue", text: "Une erreur est survenue" },
	{ value: "user_not_found", text: "Urilisateur non trouvé" },
];

/**
 * cherche dans le tableau d'erreur celle qui correspond à la clé passée en paramètre
 * et renvoie le texte associé
 * @param {string} value  clé de l'erreur
 * @returns {string} le texte de l'erreur
 */
function errorText(value) {
	for (let i = 0; i < errors.length; i++) {
		const element = errors[i];
		if (element.value === value) return element.text;
	}
}

// les pages publiques
/* home page. */
router.get("/", async function (req, res, next) {
	let connectionLink = process.env.URL_ADMIN;
	let html = fs.readFileSync("views/index.html", "utf8");
	let shops = await Shop.find();
	console.log("qhops", shops);
	let obj = {
		shops,
		connectionLink,
	};
	let page = mustache.render(html, obj, include);
	res.send(page);
});
/* page services */
router.get("/services", function (req, res, next) {
	let html = fs.readFileSync("views/services.html", "utf8");
	let obj = { pagename: "home", title: "Express" };
	let page = mustache.render(html, obj, include);
	res.send(page);
});
/* page blog ozart */
router.get("/blog", function (req, res, next) {
	let html = fs.readFileSync("views/blog.html.mustache", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

/* page panier */
/* router.get("/cart", function (req, res, next) {
	let html = fs.readFileSync("views/cart.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
}); */

/* page login */
/* router.get("/login", function (req, res, next) {
	let html = fs.readFileSync("views/login.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
}); */

/// les pages de recherche
router.get("/research", function (req, res, next) {
	let html = fs.readFileSync("views/research.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

///

/* pages d'inscription  */
/* la page une est la meme pour tout le monde  */
/* router.get("/login/register", function (req, res, next) {
	// vérifier la query si ya une erreur et la passer à mustache
	let obj = { form: true };
	if (req.query.error) {
		obj.error = errorText(req.query.error);
	}
	if (req.query.success) {
		obj.success = true;
		obj.form = false;
	}
	let html = fs.readFileSync("views/createaccount1.html", "utf8");
	let page = mustache.render(html, obj, include);
	res.send(page);
}); */

/* étape 2 pour les acheteurs  */
/* router.get("/login/register/buyer/step2", async function (req, res, next) {
	let decoded = jwt.verify(req.query.token, process.env.TOKEN_KEY);
	let user = await User.findOne({ _id: decoded.id });
	if (user) {
		let obj = {
			token: req.query.token,
			email: decoded.email,
		};
		let html = fs.readFileSync("views/createaccount2buyer.html", "utf8");
		let page = mustache.render(html, obj, include);
		res.send(page);
	} else {
		res.status(401).send();
	}
}); */

/* étape 2 pour les venteur  */
/* router.get("/login/register/seller/step2", async function (req, res, next) {
	let decoded = jwt.verify(req.query.token, process.env.TOKEN_KEY);
	let user = await User.findOne({ _id: decoded.id });
	console.log("token in route", req.query.token);
	if (user) {
		let obj = {
			token: req.query.token,
			email: decoded.email,
		};
		console.log("obj", obj);
		let html = fs.readFileSync("views/createaccount2seller.html", "utf8");
		let page = mustache.render(html, obj, include);
		res.send(page);
	} else {
		res.status(401).send();
	}
}); */

/* étape 3 pour les venteur  */
/* router.get("/login/register/seller/step3", function (req, res, next) {
	let html = fs.readFileSync("views/createaccount3seller.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
}); */

/// les pages privées
/* router.get("/profil", authMiddleware, async function (req, res, next) {
	let user = await User.findOne({ _id: req.session.user._id });
	let obj = {
		seller: user.type === "seller",
		buyer: user.type === "buyer",
		user: user,
		completeName: function () {
			return user.firstname.charAt(0).toUpperCase() + user.firstname.substr(1) + " " + user.name.toUpperCase();
		},
	};
	let html = fs.readFileSync("views/private/profil.html", "utf8");
	let page = mustache.render(html, obj, include);
	res.send(page);
});
router.get("/profil/shop", authMiddleware, async function (req, res, next) {
	console.log("req.session.user ici ", req.session.user);
	let user = await User.findOne({ _id: req.session.user._id });
	if (!user) res.status(401).send();
	let shop = await Shop.findOne({ _id: user.shop });
	if (!shop) res.status(401).send();
	let obj = {
		user: user,
		shop: shop,
	};
	let html = fs.readFileSync("views/private/profilshop.html", "utf8");
	let page = mustache.render(html, obj, include);
	res.send(page);
}); */

/// les pages légales
router.get("/legal-notice", function (req, res, next) {
	let html = fs.readFileSync("views/footer/legal-notice.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

router.get("/help", function (req, res, next) {
	let html = fs.readFileSync("views/footer/help.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

router.get("/confidentiality", function (req, res, next) {
	let html = fs.readFileSync("views/footer/confidentiality.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

router.get("/terms-of-service", function (req, res, next) {
	let html = fs.readFileSync("views/footer/terms-of-service.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

// route particulière avec le nom des boutiques et des produits
// en dernier pour ne pas créer des conflits route
/* router.get("/:shop", function (req, res, next) {
	let html = fs.readFileSync("views/shop.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
});

router.get("/:shop/:product", function (req, res, next) {
	let html = fs.readFileSync("views/product.html", "utf8");
	let page = mustache.render(html, {}, include);
	res.send(page);
}); */

module.exports = router;
