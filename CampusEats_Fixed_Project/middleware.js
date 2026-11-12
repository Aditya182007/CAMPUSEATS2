const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Your session is invalid or expired. Please log in again." });
  }
}

module.exports = { authRequired };
