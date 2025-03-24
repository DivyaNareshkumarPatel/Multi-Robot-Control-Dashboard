const WebSocket = require('ws');
const Robot = require('../models/Robot');
const CommandHistory = require('../models/CommandHistory');

// Store connected robots and clients
const robots = {}; // { robotId: { ws: WebSocket, apiKey: string } }
const clients = {}; // { clientId: WebSocket }

// Initialize WebSocket server with the HTTP server
function initializeWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    
    console.log('Robot WebSocket server initialized');

    wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection established');
        
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'register') {
                    // Register robot or client
                    if (data.role === 'robot') {
                        // Verify the robot's API key
                        if (!data.apiKey) {
                            ws.send(JSON.stringify({ type: 'error', message: 'API key is required for robot registration' }));
                            return;
                        }

                        // Validate API key against database
                        const robot = await Robot.findOne({ robotId: data.robotId, apiKey: data.apiKey });
                        if (!robot) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid robot ID or API key' }));
                            return;
                        }

                        robots[data.robotId] = { ws, apiKey: data.apiKey };
                        console.log(`Robot ${data.robotId} connected with valid API key`);
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
                    const robotData = robots[data.robotId];
                    
                    // Create command history record
                    const commandHistory = new CommandHistory({
                        robotId: data.robotId,
                        command: data.command,
                        source: data.source || 'dashboard'
                    });
                    await commandHistory.save();
                    
                    // Forward command with command history ID for reference
                    robotData.ws.send(JSON.stringify({ 
                        command: data.command,
                        commandId: commandHistory._id 
                    }));
                    console.log(`Sent command '${data.command}' to robot ${data.robotId}`);
                } else if (data.type === 'status' && data.robotId) {
                    // Update command history record
                    if (data.commandId) {
                        try {
                            await CommandHistory.findByIdAndUpdate(
                                data.commandId,
                                { 
                                    status: data.status,
                                    response: data.response || ''
                                }
                            );
                        } catch (err) {
                            console.error('Error updating command history:', err);
                        }
                    }
                    
                    // Forward robot status to all clients
                    broadcastToClients({
                        type: 'robot_status',
                        robotId: data.robotId,
                        status: data.status,
                        command: data.command,
                        response: data.response,
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
                if (robots[id].ws === ws) {
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
async function sendCommandToRobot(robotId, command, source = 'api', apiKey) {
    return new Promise(async (resolve, reject) => {
        try {
            // Verify the robot exists and API key is valid
            const robot = await Robot.findOne({ robotId });
            
            if (!robot) {
                reject(new Error(`Robot ${robotId} not found`));
                return;
            }
            
            // Validate API key if provided
            if (apiKey && robot.apiKey !== apiKey) {
                reject(new Error('Invalid API key for this robot'));
                return;
            }
            
            const robotConnection = robots[robotId];
            
            if (!robotConnection) {
                reject(new Error(`Robot ${robotId} not connected`));
                return;
            }
            
            // Create command history record
            const commandHistory = new CommandHistory({
                robotId,
                command,
                source
            });
            
            await commandHistory.save();
            
            // Send command to robot
            robotConnection.ws.send(JSON.stringify({ 
                command,
                commandId: commandHistory._id 
            }));
            
            console.log(`API sent command '${command}' to robot ${robotId}`);
            resolve({ 
                success: true, 
                message: `Command sent to robot ${robotId}`,
                commandId: commandHistory._id
            });
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

// Get command history for a robot
async function getRobotCommandHistory(robotId, limit = 10) {
    try {
        const history = await CommandHistory.find({ robotId })
            .sort({ createdAt: -1 })
            .limit(limit);
        return history;
    } catch (error) {
        console.error(`Error getting command history for robot ${robotId}:`, error);
        throw error;
    }
}

module.exports = {
    initializeWebSocketServer,
    sendCommandToRobot,
    getConnectedRobots,
    getRobotCommandHistory
}; 