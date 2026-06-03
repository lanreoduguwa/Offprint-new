const express = require("express");
const router  = express.Router();

const { adminDashboard } = require("../controller/admincontroller");

router.get("/", adminDashboard);  // GET /admin

module.exports = router;
