const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
var jwt = require("jsonwebtoken");
const mustache = require("mustache");

const includeMail = {
	header: fs.readFileSync("viewsemail/headerMail.html", "utf8"),
	footer: fs.readFileSync("viewsemail/footerMail.html", "utf8"),
};
/**
 * génère un token avec une durée de validité de 1 heure
 * @returns le tocken généré
 */
function generateToken(user) {
	var jeton = jwt.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, user_id: user._id }, process.env.TOKEN_KEY);
	return jeton;
}

/**
 * vérifie le token passé dans la request.
 * verifie que l'utilisateur existe
 * middleware appelé sur toute les routes qui nécessitent une authentification
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
async function authMiddleware(request, response, next) {
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
}

module.exports.controller = (app) => {
	/**
	 * création de l'utilisateur plus envoie du mail de confirmation de l'email
	 * qui contient un lien pour poursuivre l'inscription
	 */
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
				let token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.TOKEN_KEY);
				let obj = {
					emailLink: process.env.URL_SITE + "/login/register/" + newUser.type + "/step2?token=" + token,
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
						res.redirect("/login/register?success=email_inscription_envoye");
					})
					.catch((err) => {
						console.log(err.statusCode);
						res.redirect("/login/register?error=erreur_survenue");
					});
			})
			.catch((err) => {
				console.log("erreur : ", err);
				res.redirect("/login/register?error=email_not_valid");
			});
	});

	/**
	 * Route appelée depuis le lien dans l'email entre l'étape 1 et 2
	 * si le token est ok renvoie vers l'étape 2
	 */
	app.get("/createaccount/step2", async function (req, res) {
		if (user) {
			res.redirect("/login/register/" + user.type + "/step2?token=" + req.query.token);
		} else {
			response.status(401).send();
		}
	});

	app.post("/createaccount/step2/buyer", async function (req, res) {
		let decoded = jwt.verify(req.query.token, process.env.TOKEN_KEY);
		let user = await User.findOne({ _id: decoded.id });
		if (user) {
			//
			res.redirect("/?token=" + req.query.token);
		} else {
			res.status(401).send();
		}
	});

	app.post("/createaccount/step2/seller", async function (req, res) {
		let decoded = jwt.verify(req.query.token, process.env.TOKEN_KEY);
		let user = await User.findOne({ _id: decoded.id });
		if (user) {
			//
			res.redirect("/?token=" + req.query.token);
		} else {
			res.status(401).send();
		}
	});

	/**
	 * login
	 */
	app.post("/login", async function (req, res) {
		console.log("req.body", req.body);
		let user = await User.findOne({ email: req.body.email });
		console.log("user", user);
		if (!user) res.send("user_not_found");

		let hash = user.password;
		bcrypt.compare(req.body.password, hash).then(async function (res) {
			if (res) {
				let token = generateToken(user);
				response.send({ token });
			} else {
				response.status(401);
				response.send("pas ok");
				return;
			}
		});
	});
};
