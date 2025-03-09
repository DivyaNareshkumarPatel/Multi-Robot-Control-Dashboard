const express = require('express');
const Robot = require('../../models/Robot');

const router = express.Router();
const API_KEY = 'push_server_robot_authentication';

const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key || key !== API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
};

router.get('/robots', authenticate, async (req, res) => {
    try {
        const robots = await Robot.find();
        res.json(robots);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/robots/:robotId', authenticate, async (req, res) => {
    try {
        const robot = await Robot.findOne({ robotId: req.params.robotId });
        if (!robot) {
            return res.status(404).json({ message: 'Robot not found' });
        }
        res.json(robot);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post("/robots/commands", authenticate, async (req, res) => {
    try {
        const { robotId, command } = req.body;

        if (!robotId || !command) {
            return res.status(400).json({ message: "robotId and command are required" });
        }

        console.log(`Command received: Robot ${robotId} -> ${command}`);

        res.status(200).json({ message: "Command sent successfully", robotId, command });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.post("/robots/response", authenticate, async (req, res) => {
    try {
        const { robotId, response } = req.body;

        if (!robotId || !response) {
            return res.status(400).json({ message: "robotId and response are required" });
        }

        console.log(`Response received: Robot ${robotId} -> ${response}`);

        res.status(200).json({ message: "Response received successfully", robotId, response });
    } catch (error) {

        console.log(error.message)

        res.status(500).json({ message: "Server Error", error: error.message });
    }
});


module.exports = router;