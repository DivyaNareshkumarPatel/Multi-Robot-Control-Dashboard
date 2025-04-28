const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sendCommandToRobot } = require('../websocket/robotSocketServer');
const ChatbotUser = require('../models/Chatbot');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ChatHistory = require('../models/Chat');
const CommandHistory = require('../models/CommandHistory');
require('dotenv').config();

const router = express.Router();

if (!process.env.GOOGLE_API_KEY) {
    console.error("FATAL ERROR: GOOGLE_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your preferred model

// In-memory store for conversation histories (replace with DB later if needed)
const chatHistories = {};

const COMMAND_PREFIX = "robot command:";

// Middleware to authenticate user tokens
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;  // Attach the user object to the request
        console.log('Authenticated user:', req.user);
        next();
    });
}

// Route to send messages
// Route to send messages
router.post('/send', authenticateToken, async (req, res) => {
    const { message, chatId } = req.body;
    const { user } = req;

    if (!message || !chatId) {
        return res.status(400).json({ error: 'Message and chatId are required.' });
    }

    try {
        // Find the chat and ensure it belongs to the authenticated user
        const chat = await ChatHistory.findById(chatId);
        if (!chat || chat.userId.toString() !== user.id) {
            return res.status(404).json({ error: 'Chat not found or not owned by the user.' });
        }

        // Save user message to DB first
        await ChatHistory.updateOne(
            { _id: chatId },
            { $push: { messages: { text: message, sender: 'user', timestamp: new Date() } } }
        );

        // Handle Robot Command
        if (message.trim().toLowerCase().startsWith(COMMAND_PREFIX)) {
            const commandParts = message.substring(COMMAND_PREFIX.length).trim().split(' ');
            const robotId = commandParts[0];
            const command = commandParts.slice(1).join(' ');

            if (!robotId || !command) {
                const invalidCommandReply = "Invalid command format. Use 'robot command: <robotId> <command text>'";
                
                await ChatHistory.updateOne(
                    { _id: chatId },
                    { $push: { messages: { text: invalidCommandReply, sender: 'bot', timestamp: new Date() } } }
                );

                return res.json({ reply: invalidCommandReply });
            }

            try {
                console.log(`Sending command to robot ${robotId}: ${command}`);
                const result = await sendCommandToRobot(robotId, command, 'chatbot');
                console.log('Command result:', result);

                const confirmationText = `Command "${command}" sent to robot ${robotId}. Command ID: ${result.commandId}`;
                console.log(confirmationText, chatId)
                await ChatHistory.updateOne(
                    { _id: chatId },
                    { $push: { messages: { text: confirmationText, sender: 'bot', timestamp: new Date() } } }
                );
                return res.json({ reply: confirmationText });

            } catch (error) {
                console.error(`Error sending command to robot ${robotId}:`, error.message);

                const errorText = `Error sending command to robot ${robotId}: ${error.message}`;
                console.log(errorText, chatId)
                await ChatHistory.updateOne(
                    { _id: chatId },
                    { $push: { messages: { text: errorText, sender: 'bot', timestamp: new Date() } } }
                );

                return res.json({ reply: errorText });
            }
        } 
        else {
            const formattedHistory = chat.messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            const chatInstance = model.startChat({
                history: formattedHistory,
                generationConfig: {
                    maxOutputTokens: 100,
                },
            });

            const result = await chatInstance.sendMessage(message);
            const response = await result.response;
            const botReplyText = response.text();

            // Save bot response to chat history
            await ChatHistory.updateOne(
                { _id: chatId },
                { $push: { messages: { text: botReplyText, sender: 'bot', timestamp: new Date() } } }
            );

            res.json({ reply: botReplyText });
        }

    } catch (error) {
        console.error('Error in /send:', error);
        res.status(500).json({ error: 'Internal server error while sending message.' });
    }
});


// Route to fetch chat history
router.get('/chat-history', authenticateToken, async (req, res) => {
    const { user } = req;

    try {
        const chat = await ChatHistory.find({ userId: new mongoose.Types.ObjectId(user.id) });
        if (!chat) {
            return res.status(404).json({ error: 'No chat history found.' });
        }

        res.json({ chatHistory: chat });
        console.log(chat)

    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history.' });
    }
});

// Route to sign up
router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    try {
        const existingUser = await ChatbotUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken.' });
        }

        const newUser = new ChatbotUser({ fullName, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup.' });
    }
});

// Route to log in
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const user = await ChatbotUser.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// Route to start a new chat
router.post('/new-chat', authenticateToken, async (req, res) => {
    const { user } = req;

    try {
        const newChat = new ChatHistory({ userId: user.id, messages: [] });
        await newChat.save();

        res.status(201).json({ message: 'New chat started successfully.', chatId: newChat._id });

    } catch (error) {
        console.error('Error creating new chat:', error);
        res.status(500).json({ error: 'Failed to start new chat.' });
    }
});

module.exports = router;
