const Robot = require('../models/Robot');
const User = require('../models/User')
const CommandHistory = require('../models/CommandHistory');
const { sendCommandToRobot, getRobotCommandHistory } = require('../websocket/robotSocketServer');

const createRobot = async (req, res) => {
  try {
    const { robotId } = req.body;
    const existingRobot = await Robot.findOne({ robotId });
    if (existingRobot) {
      return res.status(400).json({success:false, message: "Robot ID already exists." });
    }

    const robot = new Robot(req.body);
    await robot.save();
    res.status(201).json({success:true, message: 'Robot registered successfully!', robot });

  } catch (error) {
    console.error("Error in robot registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

const getRobotByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate("robots");
    if (!user) {
      return res.status(404).json({ message: "User not found", robots: [] });
    }
    res.status(200).json(user.robots);
  } catch (error) {
    res.status(500).json({ error: error.message, robots: [] });
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

const addControlTitle = async (req, res) => {
  try {
    const { robotId, title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Control title is required" });
    }

    const robot = await Robot.findOne({ robotId });
    if (!robot) return res.status(404).json({ message: "Robot not found" });

    const existingControl = robot.controls.find(control => control.title === title);
    if (existingControl) {
      return res.status(400).json({ message: "Control title already exists" });
    }

    robot.controls.push({ title, controls: [] });
    await robot.save();

    return res.status(200).json({ message: "Control title added successfully!", robot });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const addControls = async (req, res) => {
  try {
    const { robotId, title, controls } = req.body;

    if (!title || !Array.isArray(controls) || controls.length === 0) {
      return res.status(400).json({ message: "Title and controls are required" });
    }

    const robot = await Robot.findOne({ robotId });
    if (!robot) return res.status(404).json({ message: "Robot not found" });

    const controlTitle = robot.controls.find(control => control.title === title);
    if (!controlTitle) {
      return res.status(404).json({ message: "Control title not found" });
    }

    // Prevent duplicate controls
    const newControls = controls.filter(ctrl => !controlTitle.controls.includes(ctrl));

    if (newControls.length === 0) {
      return res.status(400).json({ message: "All controls already exist" });
    }

    controlTitle.controls.push(...newControls);
    await robot.save();

    return res.status(200).json({ message: "Controls added successfully!", robot });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const deleteControlTitle = async (req, res) => {
  try {
    const { robotId, title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Control title is required" });
    }

    const robot = await Robot.findOne({ robotId });
    if (!robot) return res.status(404).json({ message: "Robot not found" });

    const controlIndex = robot.controls.findIndex(control => control.title === title);
    if (controlIndex === -1) {
      return res.status(404).json({ message: "Control title not found" });
    }

    robot.controls.splice(controlIndex, 1);
    await robot.save();

    return res.status(200).json({ message: "Control title deleted successfully!", robot });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const deleteControl = async (req, res) => {
  try {
    const { robotId, title, control } = req.body;

    if (!title || !control) {
      return res.status(400).json({ message: "Title and control are required" });
    }

    const robot = await Robot.findOne({ robotId });
    if (!robot) return res.status(404).json({ message: "Robot not found" });

    const controlTitle = robot.controls.find(c => c.title === title);
    if (!controlTitle) {
      return res.status(404).json({ message: "Control title not found" });
    }

    controlTitle.controls = controlTitle.controls.filter(c => c.toString() !== control.toString());

    // Remove empty control titles
    if (controlTitle.controls.length === 0) {
      robot.controls = robot.controls.filter(c => c.title !== title);
    }

    await robot.save();

    return res.status(200).json({ message: "Control deleted successfully!", robot });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const getControlTitlesAndControls = async (req, res) => {
  try {
    const { robotId } = req.params;
    const robot = await Robot.findOne({ robotId });

    if (!robot) return res.status(404).json({ message: "Robot not found" });

    return res.status(200).json(robot.controls);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};


module.exports = {
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
};