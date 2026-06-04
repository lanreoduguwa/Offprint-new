const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token =
    req.cookies?.adminToken ||
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    if (req.accepts("html")) return res.redirect("/admin/login");
    return res.status(401).json({ success: false, error: "Not authorized." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    if (req.accepts("html")) return res.redirect("/admin/login");
    return res.status(401).json({ success: false, error: "Token invalid or expired." });
  }
};

module.exports = { protect };