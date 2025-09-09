const MissedCall = require("../models/missedCall");

const saveMissedCall = async ({ to, from, name }) => {
  try {
    const missedCall = new MissedCall({ to, from, name });
    await missedCall.save();
    return missedCall;
  } catch (error) {
    console.error("Error saving missed call:", error);
  }
};

const getMissedCalls = async (req, res) => {
  try {
    const userId = req.user.id;
    const calls = await MissedCall.find({ to: userId, seen: false })
      .populate("from", "name email")
      .sort({ timestamp: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: "Error fetching missed calls" });
  }
};

const markMissedCallsSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    await MissedCall.updateMany({ to: userId, seen: false }, { seen: true });
    res.json({ message: "Missed calls marked as seen" });
  } catch (error) {
    res.status(500).json({ message: "Error updating missed calls" });
  }
};

module.exports = { saveMissedCall, getMissedCalls, markMissedCallsSeen };
