const express = require('express');
const router = express.Router();

const {
    assignRobottoUser,
    getAssignedRobots,
    getAssignedUser,
    deassignRobotFromUser
} = require('../controllers/user.robot.controller');

router.post('/assignRobot', assignRobottoUser);
router.get('/getAssignedRobots/:userId', getAssignedRobots);
router.get('/getAssignedUsers/:robotId', getAssignedUser);
router.post('/deassignRobot', deassignRobotFromUser);

module.exports = router;