const express = require("express");
const { getMissedCalls, markMissedCallsSeen } = require("../controllers/missedCallController");

const router = express.Router();

router.get("/", getMissedCalls);
router.put("/seen", markMissedCallsSeen);

module.exports = router;