const WebSocket = require('ws');
const { ChatHistory } = require('../models/Chat'); // Import your ChatHistory model
const mongoose = require('mongoose');

let wss = null; // WebSocket server instance

// Function to initialize WebSocket server
function initWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    console.log('Client connected');

    // Send chat history when the connection is established
    ws.on('message', async (message) => {
      console.log('Received:', message);

      // Fetch chat history from the database when a client connects
      try {
        const chatHistory = await ChatHistory.find().populate('userId', 'fullName'); // Adjust if needed
        ws.send(JSON.stringify({ type: 'chat-history', data: chatHistory }));
      } catch (error) {
        console.error('Error fetching chat history:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch chat history' }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

function broadcastChatHistory(chat) {
  if (wss) {
    const message = {
      type: 'chat-update',
      data: chat, // Send the updated chat data
    };

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message)); // Send the data to all connected clients
      }
    });
  }
}

// Export the functions
module.exports = {
  initWebSocket,
  broadcastChatHistory,
};
