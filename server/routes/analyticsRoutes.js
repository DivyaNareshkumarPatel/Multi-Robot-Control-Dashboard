const express = require("express");
const router = express.Router();
const RobotAnalytics = require("../models/RobotAnalytics");
router.get("/getData", async (req, res) => {
  try {
    const { robotId } = req.query;

    const filter = robotId ? { robotId } : {};
    const analytics = await RobotAnalytics.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
