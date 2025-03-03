const mongoose = require('mongoose');

const RobotSchema = new mongoose.Schema({
  robotName: {
    type: String,
    required: true,
    minlength: 3,
  },
  robotId: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9_-]+$/,
  },
  ram: {
    type: Number,
    required: true,
    min: 1,
  },
  cpu: {
    type: String,
    required: true,
  },
  rom: {
    type: Number,
    required: true,
    min: 1,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  yearOfManufacture: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear(),
  },
}, { timestamps: true });

const Robot = mongoose.model('Robot', RobotSchema);
module.exports = Robot;