const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Order = require("../schema/orderSchema.js");
const Shop = require("../schema/shopSchema.js");
const Product = require("../schema/productSchema.js");
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
	/**
	 * pour le panier étape 2
	 * vérifie l'id de la commande si pas ok retourn sur panier étape 1
	 */
	app.get("/site/orders/:id", async function (req, res) {
		let order = await Order.findOne({ _id: req.params.id }).populate("user").populate("orderlines.product").exec();
		if (!order) return res.send({ err: "order_not_found", errtxt: "order non trouvé" });
		res.send({ success: "order_get_ok", order });
	});

	app.post("/site/orders/create", async function (req, res) {
		console.log("req.body", req.body);
		let decoded;
		try {
			decoded = jwt.verify(req.body.userToken, process.env.TOKEN_KEY);
		} catch (error) {
			// pas de token ou token faux
			console.log("catch erreur", error);
			res.redirect(process.env.URL_SITE + "/panier?success=false&action=order");
			return;
		}

		// création d'une comande
		// préparation du tableau de produits et recalcul des totaux
		let tabProduct = [];
		let cart = JSON.parse(req.body.cart);
		let tt_ttc = 0,
			tt_tva = 0,
			tt_taxes = 0;
		for (let i = 0; i < cart.length; i++) {
			const line = cart[i];
			let row_pr = await Product.findOne({ _id: line.product.id }).exec();
			if (!row_pr) continue;
			tt_ttc += row_pr.price * line.quantity;
			tt_taxes += row_pr.port;
			tt_tva += row_pr.price * (row_pr.tva / 1000);
			tabProduct.push({
				product: row_pr._id,
				quantity: line.quantity,
			});
		}

		// définition et enregistrement de la comande
		let newOrder = new Order();
		newOrder.status = "created";
		newOrder.user = decoded.id;
		newOrder.created = new Date();
		newOrder.orderlines = tabProduct;
		newOrder.total_global = tt_ttc + tt_taxes;
		newOrder.total_ttc = tt_ttc;
		newOrder.total_tva = tt_tva;
		newOrder.shipping_taxes = tt_taxes;

		console.log("newOrder", newOrder);
		let order = await newOrder.save();

		res.redirect(process.env.URL_SITE + "/panier/step2/" + order._id);
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
