const express = require("express");
const router  = express.Router();

const { showLogin, login, logout, setup } = require("../controllers/authController");

router.get("/login",   showLogin);
router.post("/login",  login);
router.get("/logout",  logout);
router.post("/setup",  setup);

module.exports = router;