const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const fs = require("fs-extra");
const User = require("../schema/userSchema.js");
const Shop = require("../schema/shopSchema.js");
const Product = require("../schema/productSchema.js");
const mailjet = require("node-mailjet").connect(process.env.MAILHET_APIKEY, process.env.MAILHET_SECRETKEY);
const path = require("path");
var glob = require("glob");

module.exports.controller = (app) => {
	app.get("/products", async function (req, res) {
		let products = await Product.find().exec();
		res.send({ products });
	});

	app.get("/admin/shops/:id/products", Services.accessCHECK, async function (req, res) {
		let products = await Product.find({ shop: req.params.id }).exec();

		res.send({ products });
	});

	/**
	 * mise à jour d'un produit id du produit passé dans la route
	 */
	app.put("/admin/products/:id", Services.accessCHECK, async function (req, res) {
		const dataProduct = { ...req.body };
		console.log("data", dataProduct);
		await Product.updateOne({ _id: req.params.id }, dataProduct);
		//on met à jour le nombre de produit dans la shop
		/* 		let shop = await Shop.findOne({ _id: dataProduct._id }).exec();
		await Shop.updateOne({ _id: shop._id }, { nb_products: shop.nb_products + 1 }); */

		res.send({ success: "product_updated" });
	});

	/**
	 * création d'un produit id de la boutique passé dans la route
	 */
	app.post("/admin/shops/:id/products", Services.accessCHECK, async function (req, res) {
		let newProduct = new Product();

		// tab propriété
		// newProduct[propriété] = req.body[propriété];

		newProduct.name = req.body.name;
		newProduct.description = req.body.description;
		newProduct.characteristics = req.body.characteristics;
		newProduct.shop = req.params.id;

		console.log("newProduct", newProduct);
		newProduct.save();
		//on met à jour le nombre de produit dans la shop
		let shop = await Shop.findOne({ _id: newProduct.shop }).exec();
		await Shop.updateOne({ _id: shop._id }, { nb_products: shop.nb_products + 1 });

		res.send({ success: "product_updated" });
	});

	/**
	 * création ou modification d'images d'un produit, id du produit passé dans la route
	 */
	app.post("/admin/products/:id/images", Services.accessCHECK, async function (req, res) {
		let product = await Product.findOne({ _id: req.params.id });
		if (!product) return res.send({ err: "product_not_found", errtxt: "erreur lors de l'enregistrement des images" });

		fs.ensureDirSync("./uploads/product");
		fs.ensureDirSync("./uploads/product/" + product._id);

		let files = glob.sync("./uploads/product/" + product._id + "/*", {});
		let nbImage = files.length;
		console.log("nbImage", nbImage);
		let tabErr = [];
		if (req.files && req.files.images) {
			console.log("req.files.images", req.files.images);
			for (let i = 0; i < req.files.images.length; i++) {
				const image = req.files.images[i];
				// on crée le fichier dans uploads
				let f = path.basename(image.name);
				let ext = path.extname(f).toLowerCase();
				path = "./uploads/product/" + product._id + "/" + product._id + "_" + i + ext;
				image.mv(path, async function (err) {
					if (err) tabErr.push(err);
				});
			}
		}
		if (tabErr.length) {
			return res.send({ err: "post_productimage_error", errtxt: "erreur lors de l'enregistrement des images" });
		} else {
			//  on met à jour juste le user.avatar
			pathMainImage = "/product/" + product._id + "/" + product._id + "_0" + ext;
			await Product.updateOne({ _id: product._id }, { main_picture: pathMainImage });

			res.send({ success: "post_productimage_success" });
		}
	});

	/**
	 * supprime un produit avec
	 * - ses images,
	 */
	app.delete("/admin/products/:id", Services.accessCHECK, async function (req, res) {
		let product = await Product.findOne({ _id: req.params.id });
		if (!product) return res.send({ err: "product_not_found", errtxt: "erreur lors de la suppression du produit" });
		//suprimer les images du produits
		/* let pathAvatar = "./uploads/avatars/" + req.params.id;
		let files = glob.sync(pathAvatar + ".*", {});
		if (files && files.length) {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				fs.unlinkSync(file);
			}
		} */

		// supprimer le produit
		await product.deleteOne();

		res.send({ success: "delete_product_success" });
	});
};
