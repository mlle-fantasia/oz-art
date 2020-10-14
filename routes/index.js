var express = require("express");
var router = express.Router();
const mustache = require("mustache");
const fs = require("fs-extra");
const include = {
	head: fs.readFileSync("views/head.html", "utf8"),
	header: fs.readFileSync("views/header.html", "utf8"),
	footer: fs.readFileSync("views/footer.html", "utf8"),
};
/* GET home page. */
router.get("/", function (req, res, next) {
	let html = fs.readFileSync("views/index.html", "utf8");
	let obj = { name: "Laura" };
	let page = mustache.render(html, obj, include);
	res.send(page);
	//res.render("index", { name: "Sherlynn" });
});

router.get("/services", function (req, res, next) {
	//res.render("services", { title: "Express" });
	let html = fs.readFileSync("views/services.html", "utf8");
	let obj = { pagename: "home", title: "Express" };
	let page = mustache.render(html, obj, include);
	res.send(page);
});

async function getHtmlPage(pageName, layout = "") {
	// @Marina : ici on peut se passer d'un try{}catch{} ; pourquoi ???
	// @David : car on donne toujours en paramètre (pageName) une page qui existe ?
	let htmlPage = fs.readFileSync(pageName, "utf8");
	if (layout) {
		let htmlLayout = fs.readFileSync(layout, "utf8");
		htmlPage = htmlLayout.replace("__MAINPAGE__", htmlPage);
	}
	return htmlPage;
}

module.exports = router;
