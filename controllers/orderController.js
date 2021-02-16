const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Order = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
var jwt = require("jsonwebtoken");
const path = require("path");
var glob = require("glob");

module.exports.controller = (app) => {
	app.get("/admin/orders", async function (req, res) {
		res.send({ success: "get_orders_success" });
	});

	app.get("/admin/orders/:id", Services.accessCHECK, async function (req, res) {
		let user = await User.findOne({ _id: req.params.id }).exec();
		if (!user) return res.send({ err: "user_not_found", errtxt: "utilisateur non trouvé" });
		res.send({ success: "user_get_ok", data: user });
	});

	app.post("/admin/orders/:id", Services.accessCHECK, async function (req, res) {
		const data = { ...req.body };

		// tab propriété
		let tabOrderShema = [
			"products",
			"total_ht",
			"total_ttc",
			"shipping_taxes",
			"shipping_address1",
			"shipping_address2",
			"shipping_city",
			"shipping_zip",
			"shipping_phone",
			"billing_address1",
			"billing_address2",
			"billing_city",
			"billing_zip",
		];
		let newOrder = new Order();
		for (let i = 0; i < tabOrderShema.length; i++) {
			const propriete = tabOrderShema[i];
			newOrder[propriete] = data[propriete];
		}

		await newOrder.save();

		res.send({ success: "post_order_success" });
	});

	app.put("/admin/orders/:id", Services.accessCHECK, async function (req, res) {
		const data = { ...req.body };
		/* let user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(401).send(); */

		await User.updateOne({ _id: req.params.id }, data);
		// si c'est un vendeur, on met à jour aussi shop.email
		if (req.user.type === "seller") await Shop.updateOne({ _id: req.user.shop }, { email: data.email });

		let user = await User.findOne({ _id: req.params.id });
		res.send({ success: "user_edit_ok", data: { user } });
	});
};
