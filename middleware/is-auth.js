const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.isAuth = false;
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, "secretkey");
    req.userId = decodedToken.userId;
    req.role = decodedToken.role;
    req.isAuth = true;
    next();
  } catch (err) {
    next(err);
  }
};
