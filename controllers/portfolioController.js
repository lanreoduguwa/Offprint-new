const Portfolio                          = require("../models/Portfolio");
const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");

// ════════════════════════════════════════════
//  GET /api/portfolio
//  Public — fetch all portfolio items
// ════════════════════════════════════════════
const getPortfolio = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items  = await Portfolio.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, total: items.length, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Could not fetch portfolio." });
  }
};

// ════════════════════════════════════════════
//  POST /api/portfolio
//  Admin — upload new portfolio item
// ════════════════════════════════════════════
const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, category, featured } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, error: "Title and category are required." });
    }
   // Upload to Cloudinary
const result = await uploadToCloudinary(req.file.buffer, "offprint-portfolio");

const item = await Portfolio.create({
  title,
  description: description || "",
  category,
  featured:  featured === "true",
  imageUrl:  result.secure_url,
  publicId:  result.public_id,
});

    console.log(`🖼️  Portfolio item added: ${item.title} [${item.category}]`);
    return res.status(201).json({ success: true, message: "Portfolio item added!", data: item });
  } catch (err) {
    console.error("Portfolio add error:", err.message);
    return res.status(500).json({ success: false, error: "Could not add portfolio item." });
  }
};

// ════════════════════════════════════════════
//  PUT /api/portfolio/:id
//  Admin — edit title, description, category
//          optionally replace image
// ════════════════════════════════════════════
const updatePortfolioItem = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Item not found." });

    const { title, description, category, featured } = req.body;
    if (title)       item.title       = title;
    if (description) item.description = description;
    if (category)    item.category    = category;
    if (featured !== undefined) item.featured = featured === "true";

    // If a new image was uploaded, delete the old one from Cloudinary
  if (req.file) {
  await cloudinary.uploader.destroy(item.publicId);
  const result  = await uploadToCloudinary(req.file.buffer, "offprint-portfolio");
  item.imageUrl = result.secure_url;
  item.publicId = result.public_id;
}

    await item.save();
    return res.json({ success: true, message: "Portfolio item updated!", data: item });
  } catch (err) {
    console.error("Portfolio update error:", err.message);
    return res.status(500).json({ success: false, error: "Could not update portfolio item." });
  }
};

// ════════════════════════════════════════════
//  DELETE /api/portfolio/:id
//  Admin — delete item + remove from Cloudinary
// ════════════════════════════════════════════
const deletePortfolioItem = async (req, res) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: "Item not found." });

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(item.publicId);
    await item.deleteOne();

    console.log(`🗑️  Portfolio item deleted: ${item.title}`);
    return res.json({ success: true, message: "Portfolio item deleted." });
  } catch (err) {
    console.error("Portfolio delete error:", err.message);
    return res.status(500).json({ success: false, error: "Could not delete portfolio item." });
  }
};

module.exports = { getPortfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem };
