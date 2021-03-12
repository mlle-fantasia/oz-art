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
	// routes site
	app.get("/site/products", async function (req, res) {
		console.log("coucou");
		let products = await Product.find().exec();
		res.send({ products });
	});

	// routes admin
	app.get("/admin/products", Services.accessCHECK, async function (req, res) {
		let products = [];
		if (req.query.cart) {
			console.log("req.query.cart", req.query);
		} else {
			//products = await Product.find().exec();
		}

		res.send({ products });
	});

	app.get("/admin/products/:id", Services.accessCHECK, async function (req, res) {
		let product = await Product.findOne({ _id: req.params.id });

		res.send({ product });
	});

	/**
	 * récupérer tous les produits  d'une boutique que le nom et et la caractéristique
	 * id de la boutique passé en paramètre
	 */
	app.get("/admin/shops/:id/products", Services.accessCHECK, async function (req, res) {
		let products = await Product.find({ shop: req.params.id }, "name").exec();

		res.send({ products });
	});

	/**
	 * mise à jour d'un produit id du produit passé dans la route
	 */
	app.put("/admin/products/:id", Services.accessCHECK, async function (req, res) {
		const dataProduct = { ...req.body };
		console.log("data", dataProduct);
		await Product.updateOne({ _id: req.params.id }, dataProduct);

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
		let product = await newProduct.save();

		//on met à jour le nombre de produit dans la shop
		let shop = await Shop.findOne({ _id: product.shop }).exec();
		/* let newNbProducts = 1;
		if (shop.nb_products) newNbProducts = shop.nb_products + 1; */
		console.log("shop.products", shop.products, product._id);

		await Shop.updateOne({ _id: shop._id }, { $push: { products: product._id } });

		res.send({ success: "post_product_success", product: newProduct });
	});

	/**
	 * création ou modification d'images d'un produit,
	 * id du produit passé dans la route
	 */
	app.post("/admin/products/:id/images", Services.accessCHECK, async function (req, res) {
		let product = await Product.findOne({ _id: req.params.id });
		if (!product) return res.send({ err: "product_not_found", errtxt: "erreur lors de l'enregistrement des images" });

		fs.ensureDirSync("./uploads/products");
		fs.ensureDirSync("./uploads/products/" + product._id);

		let tabImages = glob.sync("./uploads/products/" + product._id + "/*", {});
		const nbImages = tabImages.length;
		let tabErr = [];
		let mainPicture = "";
		// si l'utilisateur envoie qu'une image, req.files.images est un objet donc  il faut le transformer en tableau
		if (!Array.isArray(req.files.images)) req.files.images = [req.files.images];

		if (req.files && req.files.images) {
			for (let i = 0; i < req.files.images.length; i++) {
				let image = req.files.images[i];
				// on crée le fichier dans uploads
				let f = path.basename(image.name);
				let ext = path.extname(f).toLowerCase();
				let indexName = i + nbImages + 1;
				let pathImage = "./uploads/products/" + product._id + "/" + indexName + ext;
				image.mv(pathImage, async function (err) {
					if (err) tabErr.push(err);
				});
				if (indexName === 1) mainPicture = "/products/" + product._id + "/" + indexName + ext;
				tabImages.push("/products/" + product._id + "/" + indexName + ext);
			}
			// ajout des images dans propriété pictures du produit
			// s'il n'y avait pas d'image, on met à jour la propriétée main_pisture
			let dataImage = { pictures: tabImages };
			if (nbImages === 0) dataImage.main_picture = mainPicture;
			await Product.updateOne({ _id: product._id }, dataImage);
		}
		if (tabErr.length) {
			return res.send({ err: "post_productimage_error", errtxt: "erreur lors de l'enregistrement des images" });
		} else {
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
		console.log("product", product);
		//suprimer les images du produits
		fs.ensureDirSync("./uploads/products/" + product._id);
		let tabImages = glob.sync("./uploads/products/" + product._id + "/*", {});
		//let dirImages = "./uploads/products/" + product._id;
		//fs.rmdirSync(dirImages, { recursive: true }); // avec node js 12
		if (tabImages && tabImages.length) {
			// on supprime chaque image
			for (let i = 0; i < tabImages.length; i++) {
				const img = tabImages[i];
				fs.unlinkSync(img);
			}
			// on supprime le répertoire
			fs.rmdirSync("./uploads/products/" + product._id);
		}

		//on suprime le produit dans la fiche shop
		await Shop.updateOne({ _id: product.shop }, { $pull: { products: product._id } });

		// supprimer le produit
		await product.deleteOne();

		res.send({ success: "delete_product_success" });
	});
};
