const WebSocket = require('ws');

// Store connected robots and clients
const robots = {}; // { robotId: WebSocket }
const clients = {}; // { clientId: WebSocket }

// Initialize WebSocket server with the HTTP server
function initializeWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    
    console.log('Robot WebSocket server initialized');

    wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection established');
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'register') {
                    // Register robot or client
                    if (data.role === 'robot') {
                        robots[data.robotId] = ws;
                        console.log(`Robot ${data.robotId} connected`);
                        ws.send(JSON.stringify({ type: 'ack', message: `Robot ${data.robotId} registered` }));
                        
                        // Notify all clients about new robot connection
                        broadcastRobotStatus(data.robotId, 'connected');
                    } else if (data.role === 'client') {
                        clients[data.clientId] = ws;
                        console.log(`Client ${data.clientId} connected`);
                        ws.send(JSON.stringify({ type: 'ack', message: `Client ${data.clientId} registered` }));
                        
                        // Send list of available robots to the new client
                        sendAvailableRobots(ws);
                    }
                } else if (data.type === 'control' && robots[data.robotId]) {
                    // Forward control command to the selected robot
                    robots[data.robotId].send(JSON.stringify({ command: data.command }));
                    console.log(`Sent command '${data.command}' to robot ${data.robotId}`);
                } else if (data.type === 'status' && data.robotId) {
                    // Forward robot status to all clients
                    broadcastToClients({
                        type: 'robot_status',
                        robotId: data.robotId,
                        status: data.status,
                        command: data.command,
                        timestamp: data.timestamp
                    });
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid robot ID or command' }));
                }
            } catch (err) {
                console.error('Invalid message received:', message);
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format' }));
            }
        });

        ws.on('close', () => {
            // Remove disconnected clients or robots
            for (const id in robots) {
                if (robots[id] === ws) {
                    console.log(`Robot ${id} disconnected`);
                    delete robots[id];
                    broadcastRobotStatus(id, 'disconnected');
                }
            }
            for (const id in clients) {
                if (clients[id] === ws) {
                    console.log(`Client ${id} disconnected`);
                    delete clients[id];
                }
            }
        });
    });

    return wss;
}

// Send list of available robots to the client
function sendAvailableRobots(clientWs) {
    const availableRobots = Object.keys(robots).map(id => ({ id, status: 'connected' }));
    clientWs.send(JSON.stringify({
        type: 'robot_list',
        robots: availableRobots
    }));
}

// Broadcast robot status change to all clients
function broadcastRobotStatus(robotId, status) {
    broadcastToClients({
        type: 'robot_status_change',
        robotId,
        status,
        timestamp: new Date().toISOString()
    });
}

// Broadcast message to all connected clients
function broadcastToClients(message) {
    const messageStr = JSON.stringify(message);
    Object.values(clients).forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

// API to send command to a robot
function sendCommandToRobot(robotId, command, source = 'api') {
    return new Promise((resolve, reject) => {
        const robot = robots[robotId];
        
        if (!robot) {
            reject(new Error(`Robot ${robotId} not connected`));
            return;
        }
        
        try {
            robot.send(JSON.stringify({ command }));
            console.log(`API sent command '${command}' to robot ${robotId}`);
            resolve({ success: true, message: `Command sent to robot ${robotId}` });
        } catch (error) {
            console.error(`Error sending command to robot ${robotId}:`, error);
            reject(error);
        }
    });
}

// Get list of connected robots
function getConnectedRobots() {
    return Object.keys(robots).map(id => ({ id, status: 'connected' }));
}

module.exports = {
    initializeWebSocketServer,
    sendCommandToRobot,
    getConnectedRobots
}; 