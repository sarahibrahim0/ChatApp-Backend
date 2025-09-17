const express = require("express");
const { getMissedCalls, markMissedCallsSeen } = require("../controllers/missedCallController");
const protect = require("../middlewares/protect");

const router = express.Router();

router.get("/", protect, getMissedCalls);
router.put("/seen", protect, markMissedCallsSeen);

module.exports = router;