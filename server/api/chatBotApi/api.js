const express = require('express');
const Robot = require('../../models/Robot');

const router = express.Router();
const API_KEY = 'chat_bot_robot_authentication';

const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key || key !== API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
};

router.post("/robots/command", authenticate, async (req, res) => {
    try {
        const { robotId, response } = req.body;

        if (!robotId || !response) {
            return res.status(400).json({ message: "robotId and command are required" });
        }

        
        console.log(`command received: Robot ${robotId} -> ${response}`);

        res.status(200).json({ message: "Command received successfully", robotId, response });
    } catch (error) {

        console.log(error.message)

        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;