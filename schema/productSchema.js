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
	main_picture: {
		type: String,
		required: [false, ""],
	},
	price: {
		type: Number,
		required: [false, ""],
	},
	characteristics: {
		type: Array,
		required: [false, ""],
	},
});

const Product = mongoose.model("product", productSchema, "product");
module.exports = Product;
