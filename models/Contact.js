const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, trim: true, default: "" },
  email:     { type: String, required: true, trim: true, lowercase: true },
  phone:     { type: String, trim: true, default: "" },
  message:   { type: String, required: true, trim: true },
}, { timestamps: true }); 

module.exports = mongoose.model("Contact", contactSchema);
