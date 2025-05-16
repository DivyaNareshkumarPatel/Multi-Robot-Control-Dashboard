class WebSocketService {
    constructor() {
        this.socket = null;
        this.clientId = `web-client-${Date.now()}`;
        this.isConnected = false;
        this.messageListeners = [];
        this.statusListeners = [];
        this.robotListListeners = [];
        this.messageQueue = [];
        this.serverUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/robot';
        console.log('WebSocketService using URL:', this.serverUrl);
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve();
                return;
            }

            if (this.socket) {
                this.socket.close();
            }

            console.log('Attempting to connect to WebSocket server:', this.serverUrl);
            this.socket = new WebSocket(this.serverUrl);

            this.socket.onopen = () => {
                console.log('WebSocket connected successfully');
                this.isConnected = true;
                
                this._sendMessageDirectly({
                    type: 'register',
                    role: 'client',
                    clientId: this.clientId
                });
                
                this._processQueue();
                
                resolve();
            };

            this.socket.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnected = false;
                this.notifyStatusListeners('disconnected');
                
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

    _processQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this._sendMessageDirectly(message);
        }
    }

    _sendMessageDirectly(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    sendMessage(message) {
        if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
            return this._sendMessageDirectly(message);
        } else {
            this.messageQueue.push(message);
            this.connect().catch(console.error);
            return false;
        }
    }

    sendCommand(robotId, command) {
        console.log(`Sending command to robot ${robotId}: ${command}`);
        const result = this.sendMessage({
            type: 'control',
            robotId,
            command
        });
        console.log(`Command sent successfully: ${result}`);
        return result;
    }

    addMessageListener(listener) {
        this.messageListeners.push(listener);
        return () => {
            this.messageListeners = this.messageListeners.filter(l => l !== listener);
        };
    }

    addStatusListener(listener) {
        this.statusListeners.push(listener);
        return () => {
            this.statusListeners = this.statusListeners.filter(l => l !== listener);
        };
    }

    addRobotListListener(listener) {
        this.robotListListeners.push(listener);
        return () => {
            this.robotListListeners = this.robotListListeners.filter(l => l !== listener);
        };
    }

    notifyMessageListeners(message) {
        this.messageListeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error('Error in message listener:', error);
            }
        });
    }

    notifyStatusListeners(status, data) {
        this.statusListeners.forEach(listener => {
            try {
                listener(status, data);
            } catch (error) {
                console.error('Error in status listener:', error);
            }
        });
    }

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

const webSocketService = new WebSocketService();

export default webSocketService; 