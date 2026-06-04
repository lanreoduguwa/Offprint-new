const Contact     = require("../models/Contact");
const transporter = require("../config/mailer");

// ── Helper: validate email ────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── Helper: notify owner ──────────────────────
const sendOwnerEmail = async (data) => {
  const { firstName, lastName, email, phone, message } = data;
  await transporter.sendMail({
    from:    `"Offprint Website" <${process.env.EMAIL_USER}>`,
    to:      process.env.EMAIL_USER,
    subject: `New Enquiry from ${firstName} ${lastName || ""}`,
    html: `
      <h2 style="color:#c6a437;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName || ""}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left:4px solid #c6a437;padding-left:12px;">${message}</blockquote>
    `,
  });
};

// ── Helper: auto-reply to customer ───────────
const sendCustomerReply = async (data) => {
  const { firstName, email, message } = data;
  await transporter.sendMail({
    from:    `"Offprint Global Media" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "We received your message – Offprint Global Media",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;">
        <h2 style="color:#c6a437;">Thank you, ${firstName}! 🎉</h2>
        <p>We received your message and will get back to you shortly.</p>
        <blockquote style="border-left:4px solid #c6a437;padding-left:12px;color:#555;">${message}</blockquote>
        <hr style="border-color:#c6a437;">
        <p style="color:#888;font-size:13px;">
          Offprint Global Media Concepts<br>
          6/11, Awe Crescent, Onipanu, Shomolu, Lagos<br>
          +234708455540 | ${process.env.EMAIL_USER}
        </p>
      </div>
    `,
  });
};

// POST /api/contact
const submitContact = async (req, res) => {
  const { firstName, lastName, email, phoneNo, message } = req.body;

  if (!firstName || !email || !message) {
    return res.status(400).json({ success: false, error: "First name, email and message are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, error: "Invalid email address." });
  }

  try {
    const contact = await Contact.create({
      firstName,
      lastName: lastName || "",
      email,
      phone: phoneNo || "",
      message,
    });
    console.log(`📩 Contact saved — ID: ${contact._id} | ${firstName} | ${email}`);
  } catch (err) {
    console.error("Contact DB error:", err.message);
    return res.status(500).json({ success: false, error: "Could not save your message. Please try again." });
  }

  try {
    await sendOwnerEmail({ firstName, lastName, email, phone: phoneNo, message });
    await sendCustomerReply({ firstName, email, message });
  } catch (err) {
    console.warn("⚠️  Email not sent:", err.message);
  }

  return res.status(201).json({ success: true, message: "Message received! We will contact you soon." });
};

// GET /api/contact
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json({ success: true, total: contacts.length, data: contacts });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Could not fetch contacts." });
  }
};

// DELETE /api/contact/:id
const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Contact deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Could not delete contact." });
  }
};

module.exports = { submitContact, getAllContacts, deleteContact };