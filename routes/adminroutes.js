const express    = require("express");
const router     = express.Router();
const { protect }        = require("../middleware/authMiddleware");
const { adminDashboard } = require("../controllers/adminController");

router.get("/", protect, adminDashboard);

module.exports = router;