const {
    createMessage,
    getMessages,
    deleteMessage
 
  } = require("../controllers/messageController");
  const upload = require("../middlewares/multer");

  const express = require("express");
const protect = require("../middlewares/protect");
  const router = express.Router();
  
  router.post("/" ,createMessage);
  router.get("/:chatId", getMessages);
  router.delete("/:msgId" ,protect,  deleteMessage);
  
  module.exports = router;
  