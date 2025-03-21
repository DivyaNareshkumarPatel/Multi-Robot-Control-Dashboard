// WebSocket Service for connecting to the robot control WebSocket server

class WebSocketService {
    constructor() {
        this.socket = null;
        this.clientId = `web-client-${Date.now()}`;
        this.isConnected = false;
        this.messageListeners = [];
        this.statusListeners = [];
        this.robotListListeners = [];
        this.messageQueue = []; // Queue for messages when not connected
        this.serverUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            // Close existing socket if any
            if (this.socket) {
                this.socket.close();
            }

            this.socket = new WebSocket(this.serverUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                
                // Register as a client
                this._sendMessageDirectly({
                    type: 'register',
                    role: 'client',
                    clientId: this.clientId
                });
                
                // Process any queued messages
                this._processQueue();
                
                resolve();
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.notifyStatusListeners('disconnected');
                
                // Try to reconnect after 5 seconds
                setTimeout(() => {
                    this.connect().catch(console.error);
                }, 5000);
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnected = false;
                reject(error);
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);
                    
                    if (message.type === 'robot_list') {
                        this.notifyRobotListListeners(message.robots);
                    } else if (message.type === 'robot_status_change') {
                        this.notifyStatusListeners('robot_update', message);
                    } else if (message.type === 'robot_status') {
                        this.notifyStatusListeners('command_status', message);
                    } else {
                        this.notifyMessageListeners(message);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Process queued messages
    _processQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this._sendMessageDirectly(message);
        }
    }

    // Send a message directly to the socket
    _sendMessageDirectly(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Public method to send a message
    sendMessage(message) {
        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            return this._sendMessageDirectly(message);
        } else {
            // Queue the message for when we're connected
            this.messageQueue.push(message);
            // Try to connect
            this.connect().catch(console.error);
            return false;
        }
    }

    sendCommand(robotId, command) {
        return this.sendMessage({
            type: 'control',
            robotId,
            command
        });
    }

    // Add a listener for general messages
    addMessageListener(listener) {
        this.messageListeners.push(listener);
        return () => {
            this.messageListeners = this.messageListeners.filter(l => l !== listener);
        };
    }

    // Add a listener for connection status and robot status
    addStatusListener(listener) {
        this.statusListeners.push(listener);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    // Add a listener for robot list updates
    addRobotListListener(listener) {
        this.robotListListeners.push(listener);
        return () => {
            this.robotListListeners = this.robotListListeners.filter(l => l !== listener);
        };
    }

    // Notify all message listeners
    notifyMessageListeners(message) {
        this.messageListeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error('Error in message listener:', error);
            }
        });
    }

    // Notify all status listeners
    notifyStatusListeners(status, data) {
        this.statusListeners.forEach(listener => {
            try {
                listener(status, data);
            } catch (error) {
                console.error('Error in status listener:', error);
            }
        });
    }

    // Notify all robot list listeners
    notifyRobotListListeners(robots) {
        this.robotListListeners.forEach(listener => {
            try {
                listener(robots);
            } catch (error) {
                console.error('Error in robot list listener:', error);
            }
        });
    }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService; 