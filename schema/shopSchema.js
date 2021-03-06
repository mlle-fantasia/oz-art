const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const shopSchema = new mongoose.Schema({
	created: {
		type: Date,
		required: [false, ""],
	},
	user: { type: Schema.Types.ObjectId, ref: "user" },
	email: {
		type: String,
		required: [false, ""],
	},
	name: {
		type: String,
		required: [false, ""],
		unique: true,
	},
	slug: {
		type: String,
		required: [false, ""],
		unique: true,
	},
	description: {
		type: String,
		required: [false, ""],
	},
	avatar: {
		type: String,
		required: [false, ""],
	},
	address1: {
		type: String,
		required: [false, ""],
	},
	address2: {
		type: String,
		required: [false, ""],
	},
	city: {
		type: String,
		required: [false, ""],
	},
	zip: {
		type: String,
		required: [false, ""],
	},
	img_user: {
		type: String,
		required: [false, ""],
	},
	description_user: {
		type: String,
		required: [false, ""],
	},
	products: {
		type: [{ type: Schema.Types.ObjectId, ref: "product" }],
		required: [false, []],
	},
	// ceux qui aime la boutique
	admirers: {
		type: [{ type: Schema.Types.ObjectId, ref: "user" }],
		required: [false, []],
	},
	// ceux qui sont inscri à la new letters
	followers: {
		type: [{ type: Schema.Types.ObjectId, ref: "user" }],
		required: [false, []],
	},
	img_gate: {
		type: String,
		required: [false, ""],
	},
	img_couv: {
		type: String,
		required: [false, ""],
	},
	img_seller: {
		type: String,
		required: [false, ""],
	},
	description_seller: {
		type: String,
		required: [false, ""],
	},
});

shopSchema.plugin(uniqueValidator);
const Shop = mongoose.model("shop", shopSchema, "shop");
module.exports = Shop;
