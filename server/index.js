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
const chatRoutes = require("./routes/chatRoutes");
const { initializeWebSocketServer } = require("./websocket/robotSocketServer");
const {initWebSocket} = require("./websocket/chatWebSocket")

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
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);

const { wsServer: robotWss, handleUpgrade: handleRobotUpgrade } = initializeWebSocketServer();
const { handleUpgrade: handleChatUpgrade } = initWebSocket();

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  
  if (pathname === '/robot') {
    handleRobotUpgrade(request, socket, head);
  } else if (pathname === '/chat') {
    handleChatUpgrade(request, socket, head);
  } else {
    socket.destroy();
  }
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`WebSocket Server running on port ${PORT}`);
});