const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
	created: {
		type: Date,
		required: [false, ""],
	},
	user: { type: Schema.Types.ObjectId, ref: "user" },
	products: {
		type: Array,
		required: [false, ""],
	},
	total_ht: {
		type: Number,
		required: [false, ""],
	},
	total_ttc: {
		type: Number,
		required: [false, ""],
	},
	shipping_taxes: {
		type: Number,
		required: [false, ""],
	},
	shipping_address1: {
		type: String,
		required: [false, ""],
	},
	shipping_address2: {
		type: String,
		required: [false, ""],
	},
	shipping_city: {
		type: String,
		required: [false, ""],
	},
	shipping_zip: {
		type: String,
		required: [false, ""],
	},
	shipping_phone: {
		type: String,
		required: [false, ""],
	},
	billing_address1: {
		type: String,
		required: [false, ""],
	},
	billing_address2: {
		type: String,
		required: [false, ""],
	},
	billing_city: {
		type: String,
		required: [false, ""],
	},
	billing_zip: {
		type: String,
		required: [false, ""],
	},
});

const Order = mongoose.model("order", orderSchema, "order");
module.exports = Order;
