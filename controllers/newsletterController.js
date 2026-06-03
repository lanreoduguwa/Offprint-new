const Newsletter = require("../models/Newsletter");
const transporter = require("../Config/mailer");

//validate email format using regex
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// welcome email
const sendWelcomeEmail = async (email) => {
  await transporter.sendMail({
    from:    `"Offprint Global Media" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Welcome to the Offprint Family! 🌟",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0c3b2e;padding:30px;border-radius:10px;">
        <h2 style="color:#c6a437;text-align:center;">Welcome to Offprint Global Media!</h2>
        <p style="color:#fff;">You are now part of our family. You'll be the first to hear about our latest offers and projects.</p>
        <p style="color:#c6a437;font-weight:bold;">Stay creative. Stay branded. 🚀</p>
        <hr style="border-color:#c6a437;">
        <p style="color:#888;font-size:12px;text-align:center;">Offprint Global Media · Lagos, Nigeria</p>
      </div>
    `,
  });
};

//  POST /api/newsletter
//  Subscribe to newsletter
const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ success: false, error: "Please enter a valid email." });
  }

  // Save to MongoDB
  try {
    await Newsletter.create({ email });
    console.log(`📧 Newsletter subscriber saved: ${email}`);
  } catch (err) {
    // Code 11000 = duplicate email (unique constraint)
    if (err.code === 11000) {
      return res.json({ success: true, message: "You are already subscribed!" });
    }
    console.error("Newsletter DB error:", err.message);
    return res.status(500).json({ success: false, error: "Could not subscribe. Please try again." });
  }

  // Send welcome email
  try {
    await sendWelcomeEmail(email);
  } catch (err) {
    console.warn("⚠️  Welcome email not sent:", err.message);
  }

  return res.status(201).json({ success: true, message: "You are now part of our family! 🎉" });
};

//  GET /api/newsletter
//  Fetch all subscribers (admin)
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    return res.json({ success: true, total: subscribers.length, data: subscribers });
  } catch (err) {
    console.error("Fetch subscribers error:", err.message);
    return res.status(500).json({ success: false, error: "Could not fetch subscribers." });
  }
};

//  DELETE /api/newsletter/:id
//  Unsubscribe / delete (admin)
const deleteSubscriber = async (req, res) => {
  try {
    await Newsletter.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Subscriber removed." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Could not remove subscriber." });
  }
};

module.exports = { subscribe, getAllSubscribers, deleteSubscriber };

