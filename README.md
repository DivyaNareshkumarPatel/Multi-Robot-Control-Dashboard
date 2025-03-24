# Multi-Robot Control Dashboard

A web-based dashboard for monitoring and controlling multiple robots in real-time through a secure WebSocket connection.

## 📋 Overview

The Multi-Robot Control Dashboard is a full-stack web application that allows users to manage and communicate with multiple robots from a single interface. The system uses WebSockets to enable real-time bidirectional communication between the dashboard and connected robots.

![Dashboard Concept](https://via.placeholder.com/800x400?text=Robot+Control+Dashboard)

## ✨ Key Features

- **Real-time Control** - Send commands to robots and receive status updates instantly via WebSockets
- **Multi-User Access** - Assign specific robots to different users with secure access controls
- **Command History** - All commands and responses are stored in the database for auditing and analysis
- **API Key Authentication** - Robots authenticate using unique API keys for secure communication
- **Robot Simulator** - Includes a built-in simulator for testing without physical robots
- **Responsive UI** - Modern interface that works on desktop and mobile devices

## 🔧 Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time Communication**: WebSockets (ws)
- **Authentication**: JWT (JSON Web Tokens)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB database
- Git

### Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/multi-robot-control-dashboard.git
   cd multi-robot-control-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the server directory with the following:
   
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_app_password
   ADMIN_EMAIL=admin@example.com
   ```

4. **Start the development servers**
   
   In the server directory:
   ```bash
   npm start
   ```
   
   In a new terminal, in the client directory:
   ```bash
   npm start
   ```

5. **Access the application**
   
   Open your browser and navigate to `http://localhost:3000`

## 💻 Usage

### Managing Robots

1. **Register a new robot** through the admin interface
2. Each robot receives a unique API key automatically
3. Assign robots to specific users who need access

### Connecting Physical Robots

Robots connect to the system using WebSockets and authenticate with their API key:

```javascript
// Example robot client connection
const WebSocket = require('ws');

const ROBOT_ID = 'your-robot-id';
const API_KEY = 'your-robot-api-key';
const SERVER_URL = 'ws://your-server-url:5000';

const ws = new WebSocket(SERVER_URL);

ws.on('open', () => {
  // Register with the server including API key
  ws.send(JSON.stringify({ 
    type: 'register', 
    role: 'robot', 
    robotId: ROBOT_ID,
    apiKey: API_KEY 
  }));
});

// Handle incoming commands
ws.on('message', (message) => {
  const data = JSON.parse(message);
  if (data.command) {
    console.log(`Executing command: ${data.command}`);
    // Execute command and send response
  }
});
```

### Testing with the Robot Simulator

For development and testing, you can use the built-in robot simulator:

1. Start your server
2. Run the simulator:
   ```bash
   cd server
   node robot-clients/localRobot.js <robot-id> <api-key>
   ```
3. The simulator will connect to your server and respond to commands

## 🔐 Security Model

The system implements several layers of security:

1. **Robot Authentication** - Robots authenticate using unique API keys
2. **User Authentication** - Users authenticate using JWT tokens
3. **Access Control** - Many-to-many relationship between users and robots
4. **Command Validation** - All commands are validated before execution
5. **Data Persistence** - Commands and responses are stored in the database

## 🌐 Deployment Guide

### Deploying to Render

#### Backend Deployment
1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure:
   - **Name**: `multi-robot-control-api`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Select appropriate plan (at least 512MB RAM recommended)
4. Add environment variables as listed in the installation section
5. Click "Create Web Service"

#### Frontend Deployment
1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure:
   - **Name**: `multi-robot-control-dashboard`
   - **Environment**: Node
   - **Build Command**: `cd client && npm install && npm run build`
   - **Start Command**: `cd client && npm run serve` 
   - **Plan**: Static Site or Web Service plan
4. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_WS_URL=wss://your-backend-url.onrender.com
   ```
5. Click "Create Web Service"

## 🛠️ Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Check if your WebSocket server is running
   - Verify all firewalls allow WebSocket traffic
   - Ensure proper SSL configuration for WSS connections

2. **Robot Authentication Issues**
   - Verify robot API keys are correctly configured
   - Check the connection logs for authentication failures
   - Ensure the robot client is sending the proper credentials

3. **Permission Denied Errors**
   - Verify the user is authenticated
   - Check if the user has access to the requested robot
   - Review the logs for any unauthorized access attempts

## 📝 Technical Documentation

For detailed technical implementation, see the following sections:

- [Database Schema](docs/database.md)
- [API Endpoints](docs/api.md)
- [WebSocket Protocol](docs/websocket.md)
- [Security Model](docs/security.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 