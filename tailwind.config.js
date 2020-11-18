module.exports = {
	future: {
		// removeDeprecatedGapUtilities: true,
		// purgeLayersByDefault: true,
	},
	purge: [],
	theme: {
		extend: {
			colors: {
				creme: "#f4f1de",
				ocre: "#e07a5f",
				fonce: "#3d405b",
				vert: "#81b29a",
				jaune: "#f2cc8f",
			},
		},
	},
	variants: {},
	plugins: [require("tailwindcss"), require("autoprefixer")],
};
