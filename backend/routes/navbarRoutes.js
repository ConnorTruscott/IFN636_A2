const express = require("express");
const router = express.Router();
const { getNavbar } = require("../controllers/navbarController");

router.get("/", getNavbar);
router.get("/*", getNavbar);

module.exports = router;