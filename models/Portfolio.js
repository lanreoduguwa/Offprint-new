const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: "" },
  category: {
    type: String,
    required: true,
    enum: ["Branding", "Printing", "Packaging", "Book Publishing", "Gift Items", "Estate", "Others"],
  },
  imageUrl:  { type: String, required: true },   // Cloudinary URL
  publicId:  { type: String, required: true },   // Cloudinary public_id (for deletion)
  featured:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Portfolio", portfolioSchema);