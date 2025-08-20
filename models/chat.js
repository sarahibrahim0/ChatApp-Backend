const mongoose = require("mongoose");


const chat = mongoose.Schema(
  { members: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  lastMsg : {type: mongoose.Schema.ObjectId , ref : 'Message'}

},
   { timestamps: true }
);

module.exports = mongoose.model("Chat", chat);
