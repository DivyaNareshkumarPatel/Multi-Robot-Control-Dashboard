require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const robotRoutes = require("./routes/robotRoutes");
const robotApiRoutes = require("./api/pushServerApi/robotDetails");
const chatBotApiRoutes = require("./api/chatBotApi/api");
const userRobotRoutes = require("./routes/robotUserRoutes");
const { initializeWebSocketServer } = require("./websocket/robotSocketServer");

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
app.use('/api/userRobot', userRobotRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server with the HTTP server
const wss = initializeWebSocketServer(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`WebSocket Server running on port ${PORT}`);
});