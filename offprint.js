require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const connectDB          = require("./config/db");
const contactroutes      = require("./routes/contactroutes");
const newsletterroutes   = require("./routes/newsletterroutes");
const adminroutes        = require("./routes/adminroutes");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ───────────────────────
connectDB();

// ── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Public")));

// ── Routes ───────────────────────────────────
app.use("/api/contact",    contactroutes);
app.use("/api/newsletter", newsletterroutes);
app.use("/admin",          adminroutes);

// ── Catch-all: serve frontend ────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "offprint.html"));
});

// ── Start server ─────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Offprint server running  → http://localhost:${PORT}`);
  console.log(`🔐 Admin dashboard         → http://localhost:${PORT}/admin\n`);
});
