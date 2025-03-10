require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const robotRoutes = require("./routes/robotRoutes");
const robotApiRoutes = require("./api/pushServerApi/robotDetails");
const chatBotApiRoutes = require("./api/chatBotApi/api")

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/robot", robotRoutes);
app.use('/api', robotApiRoutes);
app.use('/api', chatBotApiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));