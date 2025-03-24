const WebSocket = require('ws');
const readline = require('readline');

// Configuration options
const robotId = process.argv[2] || 'local-robot';
const serverUrl = process.env.WS_SERVER_URL || 'ws://localhost:5000';

// Create WebSocket connection
const ws = new WebSocket(serverUrl);

// Set up readline interface for console interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Connection event handlers
ws.on('open', () => {
    console.log(`\n[${robotId}] Connected to WebSocket server at ${serverUrl}`);
    console.log(`[${robotId}] Registering with server...`);
    
    // Register as a robot with the server
    ws.send(JSON.stringify({ 
        type: 'register', 
        role: 'robot', 
        robotId 
    }));
    
    console.log('\n--- LOCAL ROBOT SIMULATOR ---');
    console.log('This robot will receive commands from the dashboard or chatbot');
    console.log('Press Ctrl+C to disconnect\n');
});

// Message handling
ws.on('message', (message) => {
    try {
        const data = JSON.parse(message);
        
        if (data.type === 'ack') {
            console.log(`[SERVER] ${data.message}`);
        } else if (data.command) {
            console.log(`\n[${robotId}] Received command: ${data.command}`);
            console.log(`[${robotId}] Simulating command execution...`);
            
            // Simulate execution delay
            setTimeout(() => {
                console.log(`[${robotId}] Command "${data.command}" executed successfully`);
                
                // Send a status update back to the server
                ws.send(JSON.stringify({
                    type: 'status',
                    robotId,
                    status: 'completed',
                    command: data.command,
                    timestamp: new Date().toISOString()
                }));
            }, 2000);
        }
    } catch (err) {
        console.error(`[ERROR] Failed to parse message: ${message}`);
        console.error(err);
    }
});

// Error handling
ws.on('error', (error) => {
    console.error(`[ERROR] WebSocket error:`, error.message);
});

// Disconnection handling
ws.on('close', () => {
    console.log(`\n[${robotId}] Disconnected from server`);
    rl.close();
    process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log(`\n[${robotId}] Shutting down...`);
    if (ws.readyState === WebSocket.OPEN) {
        ws.close();
    } else {
        process.exit(0);
    }
}); 