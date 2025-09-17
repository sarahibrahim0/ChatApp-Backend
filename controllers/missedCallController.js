const asyncHandler = require("express-async-handler");
const missedCall = require("../models/missedCall");

const saveMissedCall = asyncHandler(async ({ to, from, name }) => {
    const missedCall = new missedCall({ to, from, name });
    await missedCall.save();
    return missedCall;

});

const getMissedCalls = asyncHandler(async(req,res) =>{
    const userId = req.user.id;
    const calls = await missedCall.find({ to: userId, seen: false })
      .populate("from", "name email profilePhoto")
      .sort({ timestamp: -1 });
    res.json(calls);
});

const markMissedCallsSeen = asyncHandler(async(req,res) =>{
    const userId = req.user.id;
    await missedCall.updateMany({ to: userId, seen: false }, { seen: true });
    res.json({ message: "Missed calls marked as seen" });
});

module.exports = { saveMissedCall, getMissedCalls, markMissedCallsSeen };
