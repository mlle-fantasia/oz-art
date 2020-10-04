var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { name: "Sherlynn" });
});

router.get("/services", function (req, res, next) {
	res.render("services", { title: "Express" });
});

module.exports = router;
