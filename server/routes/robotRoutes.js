const express = require('express');
const router = express.Router();
const {
  createRobot,
  getAllRobots,
  getRobotById,
  updateRobot,
  deleteRobot,
  sendCommands,
  getCommandHistory,
  getRobotByEmail,
  addControlTitle,
  addControls,
  deleteControlTitle,
  deleteControl,
  getControlTitlesAndControls
} = require('../controllers/robot.controller');

router.post('/robots', createRobot);

router.get('/robots', getAllRobots);

router.get('/robots/:id', getRobotById);

router.put('/robots/:id', updateRobot);

router.delete('/robots/:id', deleteRobot);

router.post('/robots/commands', sendCommands);

router.get('/robots/:robotId/commands', getCommandHistory);

router.get('/robots/getRobotsByEmail/:email', getRobotByEmail);

router.post('/robots/addControlTitle', addControlTitle);

router.post('/robots/addControls', addControls);

router.post('/robots/deleteControlTitle', deleteControlTitle);

router.post('/robots/deleteControl', deleteControl);

router.get("/robots/:robotId/controls", getControlTitlesAndControls);

module.exports = router;
