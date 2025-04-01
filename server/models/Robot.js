const mongoose = require("mongoose");
const crypto = require("crypto");

const ControlSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Hands", "Head"
  controls: [{ type: String, required: true }], // e.g., ["Hands Up", "Hands Down"]
});

const RobotSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    robotName: { type: String, required: true, minlength: 3 },
    robotId: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9_-]+$/ },
    ram: { type: Number, required: true, min: 1 },
    cpu: { type: String, required: true },
    rom: { type: Number, required: true, min: 1 },
    manufacturer: { type: String, required: true },
    yearOfManufacture: { type: Number, required: true, min: 1900, max: new Date().getFullYear() },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(32).toString("hex"),
    },
    controls: [ControlSchema], // Adding control sections to the schema
  },
  { timestamps: true }
);

const Robot = mongoose.model("Robot", RobotSchema);
module.exports = Robot;
