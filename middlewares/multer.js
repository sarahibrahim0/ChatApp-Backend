const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({}), // تخزين مؤقت فقط
  fileFilter: function(req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "Unsupported file format" }, false);
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

module.exports = upload;
