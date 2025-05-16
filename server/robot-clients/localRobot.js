const WebSocket = require('ws');
const readline = require('readline');

const robotId = process.argv[2] || 'local-robot';
const apiKey = process.argv[3] || 'test-api-key';
const serverUrl = process.env.WS_SERVER_URL || 'ws://localhost:5000/robot';
console.log(`Attempting to connect to WebSocket server at ${serverUrl}...`);

console.log(`Starting robot simulation for: ${robotId}`);
console.log(`Using API Key: ${apiKey.substring(0, 4)}*******`);

const ws = new WebSocket(serverUrl);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

ws.on('open', () => {
    console.log(`\n[${robotId}] Connected to WebSocket server at ${serverUrl}`);
    console.log(`[${robotId}] Registering with server...`);
    
    ws.send(JSON.stringify({ 
        type: 'register', 
        role: 'robot', 
        robotId,
        apiKey 
    }));
    
    console.log('\n--- LOCAL ROBOT SIMULATOR ---');
    console.log('This robot will receive commands from the dashboard or chatbot');
    console.log('Press Ctrl+C to disconnect\n');
});

ws.on('message', (message) => {
    try {
        const data = JSON.parse(message);
        
        if (data.type === 'ack') {
            console.log(`[SERVER] ${data.message}`);
        } else if (data.type === 'error') {
            console.log(`[SERVER ERROR] ${data.message}`);
        } else if (data.command) {
            console.log(`\n[${robotId}] Received command: ${data.command}`);
            console.log(`[${robotId}] Command ID: ${data.commandId || 'unknown'}`);
            console.log(`[${robotId}] Simulating command execution...`);
            
            setTimeout(() => {
                console.log(`[${robotId}] Command "${data.command}" executed successfully`);
                
                ws.send(JSON.stringify({
                    type: 'status',
                    robotId,
                    status: 'completed',
                    command: data.command,
                    commandId: data.commandId,
                    response: `Robot ${robotId} executed "${data.command}" successfully`,
                    timestamp: new Date().toISOString()
                }));
            }, 2000);
        }
    } catch (err) {
        console.error(`[ERROR] Failed to parse message: ${message}`);
        console.error(err);
    }
});

ws.on('error', (error) => {
    console.error(`[ERROR] WebSocket error:`, error.message);
});
ws.on('close', () => {
    console.log(`\n[${robotId}] Disconnected from server`);
    rl.close();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log(`\n[${robotId}] Shutting down...`);
    if (ws.readyState === WebSocket.OPEN) {
        ws.close();
    } else {
        process.exit(0);
    }
}); 