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

module.exports = router;