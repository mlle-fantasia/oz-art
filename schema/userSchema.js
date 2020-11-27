const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
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
	name: {
		type: String,
		required: [false, ""],
	},
	firstname: {
		type: String,
		required: [false, ""],
	},
	email: {
		type: String,
		required: [true, "email for user is required"],
		unique: true,
	},
	phone: {
		type: String,
		required: [false, ""],
	},
	password: {
		type: String,
		required: [false, ""],
	},
	avatar: {
		type: String,
		required: [false, ""],
	},
	type: {
		type: String,
		required: [true, "type for user is required"],
	},
	created: {
		type: Date,
		required: [false, ""],
	},
});

userSchema.plugin(uniqueValidator);
const User = mongoose.model("user", userSchema, "user");
module.exports = User;
