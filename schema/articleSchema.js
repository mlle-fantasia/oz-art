const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "title is required"],
	},
	contenu: {
		type: String,
		required: [true, "contenu is required"],
	},
	created: {
		type: Date,
		required: [true, "created is required"],
	},
});

module.exports = articleSchema;
