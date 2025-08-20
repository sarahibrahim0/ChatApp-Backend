const ChatModel = require("../models/chat");
const MessageModel = require("../models/message");
const { cloudinaryUploadFile } = require("../utils/cloudinary");


const createMessage = async (req, res, onlineUsers, socket) => {
  const { receiverId, senderId, text , media  } = req.body;
  const io = req.io;

  if (!receiverId || !senderId) {
    return res.status(400).json({ message: "All fields are required" });
  }

if ((!text || text.trim().length === 0) && 
    (!req.body.media || req.body.media.length === 0)) {
  return res.status(400).json({ message: "Message cannot be empty" });
}
  try {
    // 1. البحث عن الشات
    let chat = await ChatModel.findOne({
      members: { $all: [receiverId, senderId] }
    });

    // 2. لو مش موجود، إنشائه
    if (!chat) {
      chat = new ChatModel({
        members: [receiverId, senderId]
      });
      await chat.save();
    }


    // 4. إنشاء الرسالة
    const newMessage = await MessageModel.create({
      chatId: chat._id,
      senderId,
      receiverId,
      text,
      media
    });

    // 5. تحديث آخر رسالة في الشات
    chat.lastMsg = newMessage._id;
    await chat.save();

    // 6. populate للـ chat
    const populatedChat = await ChatModel.findById(chat._id)
      .populate("members", "_id name profilePhoto")
      .populate({
        path: "lastMsg",
        select: "text media senderId createdAt"
      });
    // 7. إعداد الرسالة للـ socket
    const messagePayload = {
      _id: newMessage._id,
      chatId: chat._id,
      text: newMessage.text,
      media: newMessage.media, // ⬅️ دلوقتي الرسالة بترجع فيها الفايلات
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      createdAt: newMessage.createdAt
    };


    const dataToSend = {
      chat: populatedChat,
      message: messagePayload
    };

    // 8. إرسال عبر socket
    const receiver = onlineUsers.find(user => user.userId === receiverId);
    if (io) {
      if (receiver) {
        socket.to(receiver.socketId).emit("receiveMessage", dataToSend);
      }
      socket.emit("receiveMessage", dataToSend);
    }

    // 9. الرد على الـ HTTP request
    res.status(201).json({
      message: "Message sent successfully",
      data: dataToSend
    });


  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


const getMessages = async(req,res,next)=>{
  try{
    const {chatId} = req.params;
    const messages = await MessageModel.find({chatId}).populate('senderId receiverId');
    
    res.status(200).json(
        messages
);

  }catch(error){
    res.status(500).json(error.message);
  }
};





module.exports = {createMessage , getMessages};