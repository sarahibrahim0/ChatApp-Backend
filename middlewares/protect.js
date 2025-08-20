const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const protect = async (req, res, next) => {
  let token;
const authHeader = req.headers.authorization || req.headers.Authorization;
if (authHeader?.toLowerCase().startsWith("bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      console.log(req.user)
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
}
   else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = protect;
