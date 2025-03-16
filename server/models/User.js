const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  robots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Robot" }],
});

module.exports = mongoose.model("User", UserSchema);
