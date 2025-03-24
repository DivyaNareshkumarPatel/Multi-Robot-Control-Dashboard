# Multi-Robot Control Dashboard

A web-based dashboard for monitoring and controlling multiple robots with WebSocket support for real-time communication.

## Deployment Guide for Render

### Prerequisites
- Node.js (v14+)
- MongoDB database
- Git repository with your code

### Backend Deployment on Render
1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure the service:
   - **Name**: `multi-robot-control-api`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Select appropriate plan (at least 512MB RAM recommended)

4. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_app_password
   ADMIN_EMAIL=admin@example.com
   ```

5. Click "Create Web Service"

### Frontend Deployment on Render
1. Create a new Web Service on Render
2. Connect your Git repository
3. Configure the service:
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

### Required Code Changes for Production

#### 1. Update API endpoints in `client/src/api/api.js`:
```javascript
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

#### 2. Update WebSocket connection in `client/src/services/WebSocketService.js`:
```javascript
this.serverUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
```

#### 3. Ensure CORS is properly configured in `server/index.js`:
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

## Connecting to Actual Robots

Currently, the system is using a robot-client simulator. To connect to actual robots, make the following changes:

### Hardware Requirements
- Each robot should have a network connection (WiFi/Ethernet)
- Each robot should run a WebSocket client that can:
  - Authenticate with the server
  - Handle command messages
  - Send status updates

### WebSocket Protocol Implementation

The current WebSocket implementation in `server/websocket/robotSocketServer.js` supports:
- Robot registration with the server
- Client registration to receive updates
- Command forwarding from clients to robots
- Status updates from robots back to clients

#### 1. Robot Authentication
The current system already generates an API key for each robot in the database. Use this key for authentication:

```javascript
// server/websocket/robotSocketServer.js - update connection handler
const Robot = require('../models/Robot');

wss.on('connection', async (ws, req) => {
  // Extract API key from request headers or URL parameters
  const apiKey = req.headers['x-api-key'] || new URL(req.url, 'ws://localhost').searchParams.get('api_key');
  
  if (req.url.includes('/robot') && apiKey) {
    // Authenticate robot connection
    const robot = await Robot.findOne({ apiKey });
    if (!robot) {
      ws.close(4001, 'Authentication failed');
      return;
    }
    
    // Store connection with robotId
    robots[robot.robotId] = ws;
    console.log(`Robot ${robot.robotId} connected`);
    ws.send(JSON.stringify({ type: 'ack', message: `Robot ${robot.robotId} registered` }));
    
    // Notify all clients about new robot connection
    broadcastRobotStatus(robot.robotId, 'connected');
    
    // Continue with existing message handling...
  } else if (req.url.includes('/client')) {
    // Handle client connections with user authentication...
  }
});
```

#### 2. Real Robot Client Implementation

For real robots, you need to create a client that connects to the WebSocket server. Here is a template based on the simulator:

```javascript
// Robot WebSocket client implementation
const WebSocket = require('ws');

// Configuration
const ROBOT_ID = 'your-robot-id';
const API_KEY = 'your-robot-api-key';
const SERVER_URL = 'wss://your-server-url.com/robot';

// Create WebSocket connection with API key
const ws = new WebSocket(`${SERVER_URL}?api_key=${API_KEY}`);

// Connection event handlers
ws.on('open', () => {
  console.log(`Robot ${ROBOT_ID} connected to server`);
  
  // Register with the server
  ws.send(JSON.stringify({ 
    type: 'register', 
    role: 'robot', 
    robotId: ROBOT_ID 
  }));
});

// Message handling
ws.on('message', (message) => {
  try {
    const data = JSON.parse(message);
    
    if (data.command) {
      console.log(`Received command: ${data.command}`);
      
      // Implement actual robot control logic here
      executeCommand(data.command)
        .then(() => {
          // Send status update back to server
          ws.send(JSON.stringify({
            type: 'status',
            robotId: ROBOT_ID,
            status: 'completed',
            command: data.command,
            timestamp: new Date().toISOString()
          }));
        })
        .catch((error) => {
          // Send error status
          ws.send(JSON.stringify({
            type: 'status',
            robotId: ROBOT_ID,
            status: 'error',
            command: data.command,
            error: error.message,
            timestamp: new Date().toISOString()
          }));
        });
    }
  } catch (err) {
    console.error(`Failed to parse message: ${message}`);
  }
});

// Implement reconnection logic
ws.on('close', () => {
  console.log('Disconnected from server, attempting to reconnect...');
  setTimeout(connectToServer, 5000);
});

// Implement your robot's command execution logic
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    // Replace with actual robot control implementation
    // ...
    
    resolve();
  });
}
```

### Running the Robot Simulator

For testing purposes, you can use the built-in robot simulator:

1. Navigate to the server directory: `cd server`
2. Run the simulator with a robot ID: `node robot-clients/localRobot.js robot-123`
3. The simulator will connect to your local WebSocket server and respond to commands
4. You can run multiple instances to simulate multiple robots

## User-Specific Robot Access Security

The current system implements a many-to-many relationship between users and robots. A robot can be assigned to multiple users, and a user can have access to multiple robots.

### Current Database Schema

The Robot and User models are linked in a many-to-many relationship:

```javascript
// Robot.js - Already has users array
const RobotSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  robotName: { type: String, required: true },
  robotId: { type: String, required: true, unique: true },
  // Other fields...
  apiKey: { type: String, required: true, unique: true }
});

// User.js - Already has robots array
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Other fields...
  robots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Robot" }]
});
```

### Robot Assignment System

The application includes a dedicated controller (`user.robot.controller.js`) for managing the relationship between users and robots:

```javascript
// Key functions in user.robot.controller.js:

// Assign a robot to a user (creates the many-to-many relationship)
const assignRobottoUser = async (req, res) => {
  try {
    const { userId, robotId } = req.body;
    // Find the user and robot
    const user = await User.findById(userId);
    const robot = await Robot.findById(robotId);
    
    // Add user to robot's users array
    robot.users.push(userId);
    await robot.save();
    
    // Add robot to user's robots array
    user.robots.push(robot._id);
    await user.save();
    
    return res.status(200).json({ message: "Robot assigned successfully!" });
  } catch (error) {
    // Error handling
  }
}

// Get all robots assigned to a user
const getAssignedRobots = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("robots");
    return res.status(200).json(user.robots);
  } catch (error) {
    // Error handling
  }
}

// Remove a robot assignment from a user
const deassignRobotFromUser = async (req, res) => {
  try {
    const { userId, robotId } = req.body;
    // Find the user and robot
    const user = await User.findById(userId);
    const robot = await Robot.findById(robotId);
    
    // Remove user from robot's users array
    robot.users = robot.users.filter(id => id.toString() !== userId);
    await robot.save();
    
    // Remove robot from user's robots array
    user.robots = user.robots.filter(id => id.toString() !== robot._id.toString());
    await user.save();
    
    return res.status(200).json({ message: "Robot deassigned successfully!" });
  } catch (error) {
    // Error handling
  }
}
```

### API Security Enhancements

1. Add middleware to verify robot ownership for all robot-related endpoints:

```javascript
// server/middleware/robotOwnership.js
const Robot = require('../models/Robot');

module.exports = async (req, res, next) => {
  try {
    const robotId = req.params.robotId || req.body.robotId;
    const userId = req.user._id;
    
    if (!robotId) {
      return res.status(400).json({ message: 'Robot ID required' });
    }
    
    const robot = await Robot.findOne({ robotId });
    
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    
    // Check if user is in the robot's users array
    if (!robot.users.some(id => id.toString() === userId.toString())) {
      return res.status(403).json({ message: 'Access denied to this robot' });
    }
    
    // Add robot to request for further use
    req.robot = robot;
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
```

2. Use this middleware in your routes:

```javascript
// server/routes/robotRoutes.js
const robotOwnership = require('../middleware/robotOwnership');
const auth = require('../middleware/auth');

router.post('/command', auth, robotOwnership, robotController.sendCommand);
router.get('/status/:robotId', auth, robotOwnership, robotController.getRobotStatus);
```

### Command Handling

The system includes a command handler in `robot.controller.js` that can be enhanced for WebSocket support:

```javascript
// From robot.controller.js
const sendCommands = async (req, res) => {
  try {
    const { robotId, command } = req.body;
    if (!robotId || !command) {
      return res.status(400).json({ message: "Robot ID and command are required" });
    }

    console.log(`Command received: Robot ${robotId} -> ${command}`);

    // For WebSocket integration, add:
    const { sendCommandToRobot } = require('../websocket/robotSocketServer');
    
    try {
      // Try to send via WebSocket if the robot is connected
      await sendCommandToRobot(robotId, command);
      return res.status(200).json({ message: "Command sent via WebSocket", robotId, command });
    } catch (wsError) {
      console.log("WebSocket command failed, using API fallback");
      // If WebSocket fails or robot isn't connected, use your existing API method
      // (Here you would implement your API-based command delivery)
      return res.status(200).json({ message: "Command sent via API fallback", robotId, command });
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
```

### WebSocket Security Updates

1. Modify WebSocket connection to validate user+robot relationships:

```javascript
// server/websocket/robotSocketServer.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Robot = require('../models/Robot');

// Validate user access to a robot
const validateUserRobotAccess = async (userId, robotId) => {
  try {
    const robot = await Robot.findOne({ robotId });
    if (!robot) return false;
    
    return robot.users.some(id => id.toString() === userId.toString());
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};

// Extract user ID from JWT token
const getUserIdFromToken = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

// In your connection handler for clients:
wss.on('connection', async (ws, req) => {
  if (req.url.includes('/client')) {
    const token = req.headers['authorization'];
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      ws.close(4001, 'Authentication failed');
      return;
    }
    
    // Store user ID with the connection
    ws.userId = userId;
    clients[userId] = ws;
    
    // Send only the robots this user has access to
    const user = await User.findById(userId).populate('robots');
    const accessibleRobots = user.robots.map(robot => ({
      id: robot.robotId,
      name: robot.robotName,
      status: robots[robot.robotId] ? 'connected' : 'disconnected'
    }));
    
    ws.send(JSON.stringify({
      type: 'robot_list',
      robots: accessibleRobots
    }));
    
    // Handle command message with validation
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'control' && data.robotId) {
          // Verify user has access to this robot
          const hasAccess = await validateUserRobotAccess(userId, data.robotId);
          
          if (!hasAccess) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Access denied to this robot'
            }));
            return;
          }
          
          // Forward command to robot if connected
          if (robots[data.robotId]) {
            robots[data.robotId].send(JSON.stringify({ command: data.command }));
            console.log(`Sent command '${data.command}' to robot ${data.robotId}`);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: `Robot ${data.robotId} is not connected`
            }));
          }
        }
      } catch (err) {
        console.error('Invalid message:', err);
      }
    });
  }
});
```

## Troubleshooting

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

4. **Database Connection Issues**
   - Verify MONGO_URI is correct
   - Ensure network allows connections to your database
   - Check for MongoDB Atlas IP whitelist if using cloud database

### Logs and Monitoring

To better track issues, implement comprehensive logging:

```javascript
// Add structured logging in server/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'robot-control-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger;
```

Use this logger throughout your application for better debugging. 