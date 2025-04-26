const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sendCommandToRobot } = require('../websocket/robotSocketServer'); 
require('dotenv').config(); 

const router = express.Router();

if (!process.env.GOOGLE_API_KEY) {
    console.error("FATAL ERROR: GOOGLE_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"}); // Or your preferred model

//In-memory store for conversation histories (replace with DB later if needed)
const chatHistories = {};

const COMMAND_PREFIX = "robot command:";

router.post('/send', async (req, res) => {
    const { message, chatId } = req.body;

    if (!message || !chatId) {
        return res.status(400).json({ error: 'Message and chatId are required.' });
    }

    if (message.trim().toLowerCase().startsWith(COMMAND_PREFIX)) {
        const commandParts = message.substring(COMMAND_PREFIX.length).trim().split(' ');
        const robotId = commandParts[0];
        const command = commandParts.slice(1).join(' ');

        if (!robotId || !command) {
            return res.json({ reply: "Invalid command format. Use 'robot command: <robotId> <command text>'" });
        }

        try {
            console.log(`Attempting to send command to ${robotId}: ${command}`);
            const result = await sendCommandToRobot(robotId, command, 'chatbot'); 
            console.log('Command result:', result);
            if (!chatHistories[chatId]) chatHistories[chatId] = [];
             chatHistories[chatId].push({ text: message, sender: 'user' });
             const confirmationText = `Command \"${command}\" sent to robot ${robotId}. Command ID: ${result.commandId}`;
             chatHistories[chatId].push({ text: confirmationText, sender: 'bot' });
            return res.json({ reply: confirmationText });

        } catch (error) {
            console.error(`Error sending command to robot ${robotId}:`, error.message);
             if (!chatHistories[chatId]) chatHistories[chatId] = [];
             chatHistories[chatId].push({ text: message, sender: 'user' });
             const errorText = `Error sending command to robot ${robotId}: ${error.message}`;
             chatHistories[chatId].push({ text: errorText, sender: 'bot' });
            return res.json({ reply: errorText }); 
        }

    } else {
        try {
            if (!chatHistories[chatId]) {
                chatHistories[chatId] = [];
            }
            const history = chatHistories[chatId];

            const formattedHistory = history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const chat = model.startChat({
                history: formattedHistory,
                generationConfig: {
                  maxOutputTokens: 100, 
                },
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            const botReplyText = response.text();

            history.push({ text: message, sender: 'user' });
            history.push({ text: botReplyText, sender: 'bot' });
            chatHistories[chatId] = history; 

            res.json({ reply: botReplyText });

        } catch (error) {
            console.error("Error calling Gemini API:", error);
             if (!chatHistories[chatId]) chatHistories[chatId] = [];
             chatHistories[chatId].push({ text: message, sender: 'user' });
             const errorText = "Sorry, I encountered an error trying to reach the AI.";
             chatHistories[chatId].push({ text: errorText, sender: 'bot' });

            res.status(500).json({ error: 'Failed to get response from AI' });
        }
    }
});

module.exports = router; 