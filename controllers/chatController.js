

const ChatModel = require("../models/chat");
const asyncHandler = require("express-async-handler");
const createChat = asyncHandler(async(req,res , next) =>{
  const { firstId, secondId } = req.body;
  try {
   if (!firstId || !secondId){
      return res.status(400).json({ message: "All fields are required" });
    }

 

    const chat = await ChatModel.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (!chat) {
      const newChat = new ChatModel({
        members: [firstId, secondId],
      });
      await newChat.save();
      return res.status(201).json(newChat);
    }

    return res.status(200).json(chat);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const findUserChats = asyncHandler(async(req,res , next) =>{

  const userId = req.params.id;
  try {
    const chats = await ChatModel.find({ members: { $in: [userId] }})
    .populate('members', 'name email profilePhoto') // 👈 now includes profilePhoto
    .populate('lastMsg'); // Adjust the fields ('name email') based on your User model
    return res.status(200).json(chats);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const findChat = asyncHandler(async(req,res , next) =>{
  const { firstId, secondId } = req.params;

  try {
    const chat = await ChatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    return res.status(200).json(chat);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = {
  createChat,
  findUserChats,
  findChat,
};
