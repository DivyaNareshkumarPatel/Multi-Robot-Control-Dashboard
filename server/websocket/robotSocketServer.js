const WebSocket = require('ws');
const Robot = require('../models/Robot');
const CommandHistory = require('../models/CommandHistory');

const robots = {};
const clients = {};

function initializeWebSocketServer() {
    const wss = new WebSocket.Server({ noServer: true });
    
    console.log('Robot WebSocket server initialized');

    wss.on('connection', (ws, req) => {
        console.log('New WebSocket connection established');
        
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                
                if (data.type === 'register') {
                    if (data.role === 'robot') {
                        if (!data.apiKey) {
                            ws.send(JSON.stringify({ type: 'error', message: 'API key is required for robot registration' }));
                            return;
                        }
                        const robot = await Robot.findOne({ robotId: data.robotId, apiKey: data.apiKey });
                        if (!robot) {
                            ws.send(JSON.stringify({ type: 'error', message: 'Invalid robot ID or API key' }));
                            return;
                        }

                        robots[data.robotId] = { ws, apiKey: data.apiKey };
                        console.log(`Robot ${data.robotId} connected with valid API key`);
                        ws.send(JSON.stringify({ type: 'ack', message: `Robot ${data.robotId} registered` }));
                        
                        broadcastRobotStatus(data.robotId, 'connected');
                    } else if (data.role === 'client') {
                        clients[data.clientId] = ws;
                        console.log(`Client ${data.clientId} connected`);
                        ws.send(JSON.stringify({ type: 'ack', message: `Client ${data.clientId} registered` }));
                        
                        sendAvailableRobots(ws);
                    }
                } else if (data.type === 'control' && robots[data.robotId]) {
                    const robotData = robots[data.robotId];
                    
                    const commandHistory = new CommandHistory({
                        robotId: data.robotId,
                        command: data.command,
                        source: data.source || 'dashboard'
                    });
                    await commandHistory.save();
                    
                    const commandMessage = { 
                        command: data.command,
                        commandId: commandHistory._id 
                    };
                    robotData.ws.send(JSON.stringify(commandMessage));
                    console.log(`Sent command '${data.command}' to robot ${data.robotId}`, commandMessage);
                } else if (data.type === 'status' && data.robotId) {
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

    function handleUpgrade(request, socket, head) {
        console.log('Handling robot WebSocket upgrade for path:', request.url);
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    }

    return {
        wsServer: wss,
        handleUpgrade
    };
}

function sendAvailableRobots(clientWs) {
    const availableRobots = Object.keys(robots).map(id => ({ id, status: 'connected' }));
    clientWs.send(JSON.stringify({
        type: 'robot_list',
        robots: availableRobots
    }));
}

function broadcastRobotStatus(robotId, status) {
    broadcastToClients({
        type: 'robot_status_change',
        robotId,
        status,
        timestamp: new Date().toISOString()
    });
}

function broadcastToClients(message) {
    const messageStr = JSON.stringify(message);
    Object.values(clients).forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

async function sendCommandToRobot(robotId, command, source = 'api', apiKey) {
    return new Promise(async (resolve, reject) => {
        try {
            const robot = await Robot.findOne({ robotId });
            
            if (!robot) {
                reject(new Error(`Robot ${robotId} not found`));
                return;
            }
            
            if (apiKey && robot.apiKey !== apiKey) {
                reject(new Error('Invalid API key for this robot'));
                return;
            }
            
            const robotConnection = robots[robotId];
            
            if (!robotConnection) {
                reject(new Error(`Robot ${robotId} not connected`));
                return;
            }
            
            const commandHistory = new CommandHistory({
                robotId,
                command,
                source
            });
            
            await commandHistory.save();
            
            const commandMessage = {
                command,
                commandId: commandHistory._id 
            };
            robotConnection.ws.send(JSON.stringify(commandMessage));
            
            console.log(`API sent command '${command}' to robot ${robotId}`, commandMessage);
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

function getConnectedRobots() {
    return Object.keys(robots).map(id => ({ id, status: 'connected' }));
}
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