const Robot = require('../models/Robot');
const CommandHistory = require('../models/CommandHistory');
const { sendCommandToRobot, getRobotCommandHistory } = require('../websocket/robotSocketServer');

const createRobot = async (req, res) => {
  try {
    const robot = new Robot(req.body);
    await robot.save();
    res.status(201).json({ message: 'Robot registered successfully!', robot });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllRobots = async (req, res) => {
  try {
    const robots = await Robot.find();
    res.status(200).json(robots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRobotById = async (req, res) => {
  try {
    const robot = await Robot.findById(req.params.id);
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    res.status(200).json(robot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRobot = async (req, res) => {
  try {
    const robot = await Robot.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!robot) {
      return res.status(404).json({ message: 'Robot not found' });
    }
    res.status(200).json({ message: 'Robot updated successfully!', robot });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteRobot = async (req, res) => {
  try {
    const robot = await Robot.findByIdAndDelete(req.params.id);
    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }

    await User.updateMany(
      { robots: robot._id },
      { $pull: { robots: robot._id } }
    );

    res.status(200).json({ message: "Robot deleted successfully and removed from users!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendCommands = async (req, res) => {
  try {
    const { robotId, command, apiKey } = req.body;
    if (!robotId || !command) {
      return res.status(400).json({ message: "Robot ID and command are required" });
    }

    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    // Verify the robot exists and API key is valid
    const robot = await Robot.findOne({ robotId });
    
    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }
    
    if (robot.apiKey !== apiKey) {
      return res.status(401).json({ message: "Invalid API key for this robot" });
    }

    console.log(`Command received: Robot ${robotId} -> ${command}`);

    try {
      const result = await sendCommandToRobot(robotId, command, 'api', apiKey);
      res.status(200).json({ 
        message: "Command sent successfully", 
        robotId, 
        command,
        commandId: result.commandId
      });
    } catch (error) {
      console.error("Error sending command:", error);
      res.status(500).json({ message: error.message });
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getCommandHistory = async (req, res) => {
  try {
    const { robotId } = req.params;
    const { limit = 10 } = req.query;
    
    // Verify the robot exists
    const robot = await Robot.findOne({ robotId });
    
    if (!robot) {
      return res.status(404).json({ message: "Robot not found" });
    }
    
    // Get command history
    const history = await CommandHistory.find({ robotId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json(history);
  } catch (error) {
    console.error("Error getting command history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { 
  createRobot, 
  getAllRobots, 
  getRobotById, 
  updateRobot, 
  deleteRobot, 
  sendCommands,
  getCommandHistory
};