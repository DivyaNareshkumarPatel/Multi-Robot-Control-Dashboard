const mongoose = require("mongoose");

const CommandHistorySchema = new mongoose.Schema(
  {
    robotId: {
      type: String,
      required: true,
      ref: "Robot"
    },
    command: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    response: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["api", "dashboard", "chatbot"],
      default: "api",
    },
  },
  { timestamps: true }
);

const CommandHistory = mongoose.model("CommandHistory", CommandHistorySchema);
module.exports = CommandHistory; 