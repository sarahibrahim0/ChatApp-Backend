const {
    createMessage,
    getMessages
 
  } = require("../controllers/messageController");
  const upload = require("../middlewares/multer");

  const express = require("express");
  const router = express.Router();
  
  router.post("/" ,createMessage);
  router.get("/:chatId", getMessages);
  
  module.exports = router;
  