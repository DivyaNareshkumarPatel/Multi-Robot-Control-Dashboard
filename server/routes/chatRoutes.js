const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { sendCommandToRobot } = require('../websocket/robotSocketServer');
const ChatbotUser = require('../models/Chatbot');
const jwt = require('jsonwebtoken');
const {broadcastChatHistory} = require('../websocket/chatWebSocket')
const mongoose = require('mongoose');
const ChatHistory = require('../models/Chat');
const CommandHistory = require('../models/CommandHistory');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

if (!process.env.GOOGLE_API_KEY) {
    console.error("FATAL ERROR: GOOGLE_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
const chatHistories = {};

const COMMAND_PREFIX = "robot command:";

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;  
        console.log('Authenticated user:', req.user);
        next();
    });
}

router.post('/send', authenticateToken, async (req, res) => {
    const { message, chatId, fileUrl } = req.body;
    const { user } = req;

    if (!chatId || (!message && !fileUrl)) {
        return res.status(400).json({ error: 'ChatId and either message or fileUrl are required.' });
    }

    try {
        let chat = await ChatHistory.findById(chatId);
        if (!chat || chat.userId.toString() !== user.id) {
            return res.status(404).json({ error: 'Chat not found or not owned by the user.' });
        }

        const userMessageData = { text: message || '', sender: 'user', timestamp: new Date() };
        if (fileUrl) {
            userMessageData.fileUrl = fileUrl;
        }
        await ChatHistory.updateOne(
            { _id: chatId },
            { $push: { messages: userMessageData } }
        );
        
        const updatedChat = await ChatHistory.findById(chatId);
        broadcastChatHistory(updatedChat);

        if (message && message.trim().toLowerCase().startsWith(COMMAND_PREFIX)) {
            const commandParts = message.substring(COMMAND_PREFIX.length).trim().split(' ');
            const robotId = commandParts[0];
            const command = commandParts.slice(1).join(' ');

            if (!robotId || !command) {
                const invalidCommandReply = "Invalid command format. Use 'robot command: <robotId> <command text>'";
                await ChatHistory.updateOne(
                    { _id: chatId },
                    { $push: { messages: { text: invalidCommandReply, sender: 'bot', timestamp: new Date() } } }
                );
                
                const updatedChat = await ChatHistory.findById(chatId);
                broadcastChatHistory(updatedChat);
                return res.json({ reply: invalidCommandReply });
            }

            try {
                console.log(`Sending command to robot ${robotId}: ${command}`);
                const result = await sendCommandToRobot(robotId, command, 'chatbot');
                console.log('Command result:', result);
                const confirmationText = `Command \"${command}\" sent to robot ${robotId}. Command ID: ${result.commandId}`;
                await ChatHistory.updateOne(
                    { _id: chatId },
                    { $push: { messages: { text: confirmationText, sender: 'bot', timestamp: new Date() } } }
                );
                
                const updatedChat = await ChatHistory.findById(chatId);
                broadcastChatHistory(updatedChat);
                return res.json({ reply: confirmationText });

            } catch (error) {
                console.error(`Error sending command to robot ${robotId}:`, error.message);
                const errorText = `Error sending command to robot ${robotId}: ${error.message}`;
                await ChatHistory.updateOne(
                    { _id: chatId },
                    { $push: { messages: { text: errorText, sender: 'bot', timestamp: new Date() } } }
                );
                
                const updatedChat = await ChatHistory.findById(chatId);
                broadcastChatHistory(updatedChat);
                return res.json({ reply: errorText });
            }
        } 
        else {
            chat = await ChatHistory.findById(chatId);

            const formattedHistory = chat.messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text || '' }]
            }));

            const messageParts = [];

            if (fileUrl) {
                try {
                    console.log(`Fetching image from: ${fileUrl}`);
                    const imageResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const mimeType = imageResponse.headers['content-type'];
                    if (!mimeType || !mimeType.startsWith('image/')) {
                        throw new Error('Invalid content type fetched, not an image.');
                    }
                    const base64Image = Buffer.from(imageResponse.data).toString('base64');
                    
                    messageParts.push({
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image
                        }
                    });
                    console.log(`Image part added (MIME: ${mimeType})`);
                } catch (imgError) {
                    console.error(`Failed to fetch or process image from ${fileUrl}:`, imgError);
                    const errorText = `Sorry, I couldn't process the image from the provided link.`;
                     await ChatHistory.updateOne(
                        { _id: chatId },
                        { $push: { messages: { text: errorText, sender: 'bot', timestamp: new Date() } } }
                    );
                    
                    const updatedChat = await ChatHistory.findById(chatId);
                    broadcastChatHistory(updatedChat);
                    return res.json({ reply: errorText }); 
                }
            }

            if (message) {
                messageParts.push({ text: message });
                console.log('Text part added.');
            }

            if (messageParts.length === 0) {
                 return res.status(400).json({ error: 'Cannot send an empty message to the AI.' });
            }

            const chatInstance = model.startChat({
                history: formattedHistory,
                generationConfig: {
                    maxOutputTokens: 200, 
                },
            });

            console.log(`Sending ${messageParts.length} part(s) to Gemini.`);
            const result = await chatInstance.sendMessage(messageParts);
            const response = await result.response;
            const botReplyText = response.text();

            const botMessageData = { text: botReplyText, sender: 'bot', timestamp: new Date() };
            await ChatHistory.updateOne(
                { _id: chatId },
                { $push: { messages: botMessageData } }
            );
            
            const updatedChat = await ChatHistory.findById(chatId);
            broadcastChatHistory(updatedChat);

            res.json({ reply: botReplyText });
        }

    } catch (error) {
        console.error('Error in /send route:', error);
        res.status(500).json({ error: 'Internal server error while processing message.' });
    }
});

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

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    try {
        const existingUser = await ChatbotUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email ID already taken.' });
        }

        const newUser = new ChatbotUser({ fullName, email, password });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during signup.' });
    }
});

router.get('/test-broadcast', async (req, res) => {
    try {
        const chat = await Chat.findOne();
        if (!chat) {
            return res.status(404).json({ error: 'No chats found to broadcast' });
        }
        
        console.log('Broadcasting test chat update for chat ID:', chat._id);
        broadcastChatHistory(chat);
        
        return res.json({ success: true, message: 'Test broadcast sent', chatId: chat._id });
    } catch (error) {
        console.error('Error in test broadcast:', error);
        return res.status(500).json({ error: 'Error in test broadcast' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required.' });
    }

    try {
        const user = await ChatbotUser.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

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

router.get('/get-all-chats', async(req, res)=>{
    try{
        const chats = await ChatHistory.find();
        broadcastChatHistory(chats);
        return res.status(200).json(chats);
    }
    catch(error){
        console.error(error);
    return res.status(500).json({ message: "Error fetching chats" });
    }
})

module.exports = router;
