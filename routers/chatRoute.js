const {
  createChat,
  findUserChats,
  findChat,
} = require("../controllers/chatController");

const express = require("express");
const router = express.Router();

router.post("/", createChat);
router.get("/:id", findUserChats);
router.get("/find/:firstId/:secondId", findChat);

module.exports = router;
