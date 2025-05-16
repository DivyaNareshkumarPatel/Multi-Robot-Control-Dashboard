const WebSocket = require('ws');
const Chat = require('../models/Chat'); 
const mongoose = require('mongoose');

let wss = null; 
function initWebSocket() {
  wss = new WebSocket.Server({ noServer: true });
  console.log('Chat WebSocket server initialized with noServer option');
  
  wss.on('connection', ws => {
    console.log('Chat WebSocket client connected');

    sendChatHistoryToClient(ws);

    ws.on('message', async (message) => {
      console.log('Chat WebSocket received:', message);

      try {
        const data = JSON.parse(message);
        
        if (data.type === 'get_chat_history') {
          await sendChatHistoryToClient(ws, data.userId);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Error processing message' }));
      }
    });

    ws.on('close', () => {
      console.log('Chat WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('Chat WebSocket error:', error);
    });
  });
  
  function handleUpgrade(request, socket, head) {
    console.log('Handling chat WebSocket upgrade for path:', request.url);
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  
  return {
    handleUpgrade
  };
}
function broadcastNewMessage(chatId, message) {
  if (wss) {
    const payload = {
      type: 'new-message',
      chatId: chatId,
      message: message
    };

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  }
}

async function sendChatHistoryToClient(client, userId = null) {
  try {
    const query = userId ? { userId } : {};
    const chatHistory = await Chat.find(query);
    console.log(`Sending ${chatHistory.length} chats to client`);
    
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ 
        type: 'chat-history', 
        data: chatHistory 
      }));
    }
  } catch (error) {
    console.error('Error fetching chat history:', error);
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to fetch chat history' 
      }));
    }
  }
}

function broadcastChatHistory(chat) {
  if (wss) {
    const message = {
      type: 'chat-update',
      data: chat,
    };

    const clientCount = wss.clients.size;
    console.log(`Broadcasting chat update to ${clientCount} clients for chat ID: ${chat._id}`);
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message)); // Send the data to all connected clients
      }
    });
  } else {
    console.log('No WebSocket server initialized, cannot broadcast chat update');
  }
}



module.exports = {
  initWebSocket,
  broadcastChatHistory,
  broadcastNewMessage
};
