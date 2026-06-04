const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin  = require("../models/Admin");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const showLogin = (req, res) => {
  res.send(`<!DOCTYPE html>
  <html><head><title>Offprint Admin Login</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:sans-serif;background:#0c3b2e;display:flex;justify-content:center;align-items:center;min-height:100vh}
    .card{background:#fff;border-radius:12px;padding:40px;width:100%;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,.3)}
    h1{color:#0c3b2e;text-align:center;margin-bottom:6px;font-size:1.6rem}
    p{color:#888;text-align:center;margin-bottom:28px;font-size:13px}
    label{display:block;font-weight:600;color:#333;margin-bottom:6px;font-size:14px}
    input{width:100%;padding:12px;border:2px solid #ddd;border-radius:6px;font-size:14px;margin-bottom:18px}
    input:focus{border-color:#c6a437;outline:none}
    button{width:100%;padding:13px;background:#c6a437;color:#0c3b2e;border:none;border-radius:6px;font-size:15px;font-weight:700;cursor:pointer}
    button:hover{background:#0c3b2e;color:#c6a437}
    .error{background:#fee;border:1px solid #fcc;color:#c00;padding:10px;border-radius:6px;margin-bottom:16px;font-size:13px;text-align:center}
  </style></head>
  <body><div class="card">
    <h1>🖨️ Admin Login</h1>
    <p>Offprint Global Media Concepts</p>
    ${req.query.error ? `<div class="error">${req.query.error}</div>` : ""}
    <form method="POST" action="/admin/login">
      <label>Username</label>
      <input type="text" name="username" required autofocus placeholder="Enter username">
      <label>Password</label>
      <input type="password" name="password" required placeholder="Enter password">
      <button type="submit">Login</button>
    </form>
  </div></body></html>`);
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.redirect("/admin/login?error=Invalid+username+or+password");

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.redirect("/admin/login?error=Invalid+username+or+password");

    const token = generateToken(admin._id);
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect("/admin");
  } catch (err) {
    console.error("Login error:", err.message);
    return res.redirect("/admin/login?error=Server+error.+Try+again.");
  }
};

const logout = (req, res) => {
  res.clearCookie("adminToken");
  res.redirect("/admin/login");
};

const setup = async (req, res) => {
  try {
    const exists = await Admin.findOne();
    if (exists) {
      return res.json({ success: false, error: "Admin already exists." });
    }
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password required." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ username, passwordHash });
    return res.json({ success: true, message: `Admin '${username}' created. Login at /admin/login` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { showLogin, login, logout, setup };