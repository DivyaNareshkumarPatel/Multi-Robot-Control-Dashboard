const express = require('express');
const router = express.Router();
const {
  createRobot,
  getAllRobots,
  getRobotById,
  updateRobot,
  deleteRobot
} = require('../controllers/robot.controller');

router.post('/robots', createRobot);

router.get('/robots', getAllRobots);

router.get('/robots/:id', getRobotById);

router.put('/robots/:id', updateRobot);

router.delete('/robots/:id', deleteRobot);

module.exports = router;
