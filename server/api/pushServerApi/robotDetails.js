const express = require('express');
const Robot = require('../../models/Robot');
const { sendCommandToRobot, getConnectedRobots } = require('../../websocket/robotSocketServer');

const router = express.Router();
const API_KEY = 'push_server_robot_authentication';

const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key || key !== API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
};

router.get('/robots', (req, res) => {
    try {
        const robots = getConnectedRobots();
        res.json({ success: true, robots });
    } catch (error) {
        console.error('Error getting connected robots:', error);
        res.status(500).json({ success: false, message: 'Failed to get connected robots', error: error.message });
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

router.post('/robots/:robotId/command', async (req, res) => {
    const { robotId } = req.params;
    const { command } = req.body;
    
    if (!command) {
        return res.status(400).json({ success: false, message: 'Command is required' });
    }
    
    try {
        const result = await sendCommandToRobot(robotId, command);
        res.json({ success: true, message: `Command sent to robot ${robotId}`, result });
    } catch (error) {
        console.error(`Error sending command to robot ${robotId}:`, error);
        res.status(500).json({ success: false, message: 'Failed to send command', error: error.message });
    }
});

router.post('/chatbot/command', async (req, res) => {
    const { robotId, command } = req.body;
    
    if (!robotId || !command) {
        return res.status(400).json({ 
            success: false, 
            message: 'Both robotId and command are required' 
        });
    }
    
    try {
        const result = await sendCommandToRobot(robotId, command, 'chatbot');
        res.json({ 
            success: true, 
            message: `Command from chatbot sent to robot ${robotId}`, 
            result 
        });
    } catch (error) {
        console.error(`Error sending chatbot command to robot ${robotId}:`, error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send chatbot command', 
            error: error.message 
        });
    }
});

router.get('/robots/:robotId/metrics', authenticate, async (req, res) => {
    try {
        const robot = await Robot.findOne({ robotId: req.params.robotId });
        if (!robot) {
            return res.status(404).json({ message: 'Robot not found' });
        }

        const [cpu, memory] = await Promise.all([
            si.currentLoad(),
            si.mem()
        ]);

        const cpuUsage = `${cpu.currentLoad.toFixed(2)}%`;
        const ramUsage = `${((memory.active / memory.total) * 100).toFixed(2)}%`;

        const battery = robot.battery || 'Unknown';
        const ipadBattery = robot.iPadBattery || 'Unknown';

        res.json({
            battery,
            cpuUsage,
            ramUsage,
            ipadBattery
        });
    } catch (error) {
        console.error(`Error fetching metrics for robot ${req.params.robotId}:`, error);
        res.status(500).json({ message: 'Failed to fetch metrics', error: error.message });
    }
});

module.exports = router;