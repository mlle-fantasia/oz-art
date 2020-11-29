const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const shopSchema = new mongoose.Schema({
	created: {
		type: Date,
		required: [false, ""],
	},
	user: { type: Schema.Types.ObjectId, ref: "user" },
	name: {
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
});

const Shop = mongoose.model("shop", shopSchema, "shop");
module.exports = Shop;
