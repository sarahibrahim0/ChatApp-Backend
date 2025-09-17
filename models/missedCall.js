const mongoose = require("mongoose");  // <-- السطر ده ناقص

const MissedCallSchema = new mongoose.Schema({
  to: {
    type: mongoose.Schema.Types.ObjectId, // ID بتاع اليوزر اللي استقبل الكول
    ref: "User",
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId, // ID بتاع اليوزر اللي اتصل
    ref: "User",
    required: true,
  },
  name: {
    type: String, // اسم اللي اتصل
    required: true,
  },
  callType:{
  type : String,
  required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("MissedCall", MissedCallSchema);
