const express = require("express");
const router  = express.Router();

const { adminDashboard } = require("../controllers/adminController");

router.get("/", adminDashboard);  // GET /admin

module.exports = router;
