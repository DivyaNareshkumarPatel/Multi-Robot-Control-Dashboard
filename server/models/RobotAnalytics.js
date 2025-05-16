const mongoose = require("mongoose");

const RobotAnalyticsSchema = new mongoose.Schema(
  {
    robotId: {
      type: String,
      required: true,
      ref: "Robot",
      index: true,
    },
    battery: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    cpuUsage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ramUsage: {
      type: Number,
      required: true,
      min: 0,
    },
    ipadBattery: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const RobotAnalytics = mongoose.models.RobotAnalytics || mongoose.model("RobotAnalytics", RobotAnalyticsSchema);

module.exports = RobotAnalytics;
