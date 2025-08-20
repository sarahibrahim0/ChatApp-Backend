const mongoose = require("mongoose");

const message = mongoose.Schema(
  {
    chatId: {
       type: mongoose.Schema.Types.ObjectId, ref: "Chat" 
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiverId :{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
    media:[ {
      url: { type: String },       // لينك من Cloudinary
      publicId: { type: String },  // Public ID عشان نقدر نمسحه من Cloudinary
      type: { type: String },      // image | voice | file
    }],  },

  { timestamps: true }
);

module.exports = mongoose.model("Message", message);
