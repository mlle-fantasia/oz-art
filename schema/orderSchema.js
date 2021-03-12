const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
	created: {
		type: Date,
		required: [false, ""],
	},
	user: { type: Schema.Types.ObjectId, ref: "user" },
	/* 	products: {
		type: [{ type: Schema.Types.ObjectId, ref: "product" }],
		required: [false, []],
	}, */
	orderlines: {
		type: [
			{
				product: { type: Schema.Types.ObjectId, ref: "product" },
				quantity: { type: Number, required: [true, 1] },
			},
		],
		required: [false, []],
	},
	status: {
		type: String,
		required: [true, "in_progress"],
	},
	total_global: {
		type: Number,
		required: [false, 0],
	},
	total_ttc: {
		type: Number,
		required: [false, 0],
	},
	total_tva: {
		type: Number,
		required: [false, 0],
	},
	shipping_taxes: {
		type: Number,
		required: [false, 0],
	},
	// adresse de livraison
	shipping_name: {
		type: String,
		required: [false, ""],
	},
	shipping_firstname: {
		type: String,
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
	shipping_comment: {
		type: String,
		required: [false, ""],
	},
	// adresse de facturation
	billing_name: {
		type: String,
		required: [false, ""],
	},
	billing_firstname: {
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
