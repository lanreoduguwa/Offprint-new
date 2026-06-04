require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const cookieParser  = require("cookie-parser");
const path    = require("path");

const connectDB          = require("./config/DB");
const contactroutes      = require("./routes/contactroutes");
const newsletterroutes   = require("./routes/newsletterroutes");
const portfolioroutes     = require("./routes/portfolioroutes");
const authroutes          = require("./routes/authroutes");
const adminroutes        = require("./routes/adminroutes");

const app  = express();
const port = process.env.PORT || 3000;

// ── Connect to MongoDB ───────────────────────
connectDB();

// ── Middleware ───────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "Public")));

// ── Routes ───────────────────────────────────
app.use("/api/contact",    contactroutes);
app.use("/api/newsletter", newsletterroutes);
app.use("/api/portfolio",  portfolioroutes);
app.use("/admin",          authroutes);     // login/logout/setup
app.use("/admin",          adminroutes);    // dashboard (protected)
// ── Catch-all: serve frontend ────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "offprint.html"));
});

// ── Start server ─────────────────────────────
app.listen(port, () => {
  console.log(`\n✅ Offprint server running  → http://localhost:${port}`);
  console.log(`🔐 Admin dashboard         → http://localhost:${port}/admin\n`);
   console.log(`📋 First time? Create admin → POST http://localhost:${port}/admin/setup\n`);
});
