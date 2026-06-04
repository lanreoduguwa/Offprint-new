const express   = require("express");
const router    = express.Router();
const { upload } = require("../config/cloudinary");
const { protect } = require("../middleware/authMiddleware");

const {
  getPortfolio,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
} = require("../controllers/portfolioController");

router.get("/",        getPortfolio);                              // Public
router.post("/",       protect, upload.single("image"), addPortfolioItem);    // Admin
router.put("/:id",     protect, upload.single("image"), updatePortfolioItem); // Admin
router.delete("/:id",  protect, deletePortfolioItem);             // Admin

module.exports = router;