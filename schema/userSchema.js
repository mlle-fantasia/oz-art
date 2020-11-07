const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
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
module.exports = userSchema;