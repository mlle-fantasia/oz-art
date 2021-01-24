const User = require("../schema/userSchema.js");
const path = require("path");
const fs = require("fs-extra");
var glob = require("glob");
var jwt = require("jsonwebtoken");

/**
 *
 * @param {file} file le fichier ade l'avatar
 * @param {string} userId l'id de l'utilisateur
 *
 * @returns {object} { erreur: null | erreur, pathAvatar: "" | "/avatars/userId.ext"}
 */
exports.saveAvatar = async (file, userId) => {
	return new Promise((resolve) => {
		let response = { erreur: null, pathAvatar: "" };
		// suprimer les avatars existant s'il y en a
		let pathAvatar = "./uploads/avatars/" + userId;
		let files = glob.sync(pathAvatar + ".*", {});
		if (files && files.length) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				fs.unlinkSync(file);
			}
		}
		// on crée le fichier dans uploads
		console.log("file", file);
		let f = path.basename(file.avatarfile.name);
		let ext = path.extname(f).toLowerCase();
		pathAvatar += ext;
		file.avatarfile.mv(pathAvatar, async function (err) {
			if (err) response.erreur = err;
			else response.pathAvatar = "/avatars/" + userId + ext;
			console.log("response", response);
			resolve(response);
		});
	});
};

/**
 *
 * @param {"string"} avatardefault le nom de l'avatar par défault choisi
 *
 * @returns {object} { erreur: null | erreur, pathAvatar: "" | "/avatars/userId.ext"}
 */
exports.saveAvatarDefault = async (avatardefault) => {
	let defaultAvatarSelected = "./public/images/avatars-default/" + avatardefault;
	let defaultAvatarSelectedDest = "./uploads/avatars/" + avatardefault;
	//s'il n'existe pas on le copie dans le fichier upload
	let err = null;
	if (!fs.existsSync(defaultAvatarSelectedDest)) {
		await fs.copySync(defaultAvatarSelected, defaultAvatarSelectedDest);
	}
	if (err) return { pathAvatar: "", erreur: err };
	else return { pathAvatar: "/avatars/" + avatardefault, erreur: err };
};

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {next} next
 *
 * vérifie le token dans le header de la requete s'il n'est pas ok,  renvoie une erreur 401
 */
exports.accessCHECK = async (req, res, next) => {
	if (req.headers["x-auth-accesstoken"] || req.query["token"]) {
		let token = req.headers["x-auth-accesstoken"] || req.query["token"];
		console.log("token", token, process.env.TOKEN_KEY);
		let decoded = {};
		try {
			decoded = jwt.verify(token, process.env.TOKEN_KEY);
			console.log("decoded", decoded);
			if (!decoded) res.status(401).send();
			let user = await User.findOne({ _id: decoded.id });
			if (!user) return res.send({ err: "user_not_found", errtxt: "utilisateur non trouvé" });
			req.user = user;
		} catch (error) {
			console.log("error", error);
			return res.status(401).send();
		}
		next();
	} else {
		res.status(401).send();
	}
};
