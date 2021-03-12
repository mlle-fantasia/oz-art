const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
	created: {
		type: Date,
		required: [false, ""],
	},
	shop: { type: Schema.Types.ObjectId, ref: "shop" },
	name: {
		type: String,
		required: [false, ""],
	},
	description: {
		type: String,
		required: [false, ""],
	},
	pictures: {
		type: Array,
		required: [false, ""],
	},
	main_picture: {
		type: String,
		required: [false, ""],
	},
	promote: {
		type: Boolean,
		required: [true, false],
	},
	// prix en centime
	price: {
		type: Number,
		required: [true, 0],
	},
	// taux de tva number (ex 20% -> 200)
	tva: {
		type: Number,
		required: [true, 200],
	},
	// frais de port en centime
	port: {
		type: Number,
		required: [true, 0],
	},
	characteristics: {
		type: Array,
		required: [false, ""],
	},
});

const Product = mongoose.model("product", productSchema, "product");
module.exports = Product;
