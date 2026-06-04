const express    = require("express");
const router     = express.Router();
const { protect }        = require("../middleware/authMiddleware");
const { adminDashboard } = require("../controllers/authController");

router.get("/", protect, adminDashboard);

module.exports = router;