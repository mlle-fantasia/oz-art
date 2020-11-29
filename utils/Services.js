const User = require("../schema/userSchema.js");
const path = require("path");
const fs = require("fs-extra");
var glob = require("glob");

exports.saveAvatar = async (dataBody, dataFiles, userId) => {
	console.log("data in services", dataBody, dataFiles);
	let uploadPath = "./uploads/avatars";
	if (dataFiles || dataBody.avatardefault) {
		// suprimer les avatar existant s'il y en a
		let pathAvatar = uploadPath + "/" + userId;
		let files = glob.sync(pathAvatar + ".*", {});
		console.log("files", files);
		if (files && files.length) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				fs.unlinkSync(file);
			}
		}
		if (dataFiles && dataFiles.avatar) {
			console.log("req.files", dataFiles);
			let f = path.basename(dataFiles.avatar.name);
			let ext = path.extname(f).toLowerCase();
			pathAvatar += ext;
			dataFiles.avatar.mv(pathAvatar, async function (err) {
				if (err) return false;
				const data = { ...dataBody, avatar: "/avatars/" + userId + ext };
				console.log("data1", data);
				const user = await User.update({ _id: userId }, data);
				return user;
			});
		}
		if (dataBody.avatardefault) {
			console.log("req.body.avatardefault", dataBody.avatardefault);
			let defaultAvatarSelected = "./public/images/avatars-default/" + dataBody.avatardefault;
			let defaultAvatarSelectedDest = "./uploads/avatars/" + dataBody.avatardefault;
			//s'il existe déjà on enregistre juste dans user
			if (!fs.existsSync(defaultAvatarSelectedDest)) {
				await fs.copySync(defaultAvatarSelected, defaultAvatarSelectedDest);
			}
			const data = { ...dataBody, avatar: "/avatars/" + dataBody.avatardefault };
			console.log("data2", data);
			const user = await User.update({ _id: userId }, data);
			return user;
		}
	} else {
		let user = await User.findOne({ _id: userId });
		return user;
	}
};
