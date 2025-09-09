const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.toLowerCase().startsWith("bearer")) {
    return res.status(401).json({ message: "غير مصرح، لا يوجد توكن" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "اليوزر غير موجود" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "توكن غير صالح أو منتهي" });
  }
};

module.exports = protect;