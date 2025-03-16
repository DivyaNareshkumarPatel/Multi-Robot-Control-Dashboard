const Robot = require('../models/Robot');
const User = require('../models/User');

const assignRobottoUser = async (req, res) => {
    try {
        const { userId, robotId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const robot = await Robot.findById(robotId);
        if (!robot) return res.status(404).json({ message: "Robot not found" });
        if (robot.users.includes(userId)) {
            return res.status(400).json({ message: "User already assigned to this robot" });
        }
        robot.users.push(userId);
        await robot.save();
        user.robots.push(robot._id);
        await user.save();
        return res.status(200).json({ message: "Robot assigned successfully!", robot });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
}

const getAssignedRobots = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate("robots");
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json(user.robots);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
}

const getAssignedUser = async (req, res) => {
    try {
        const robot = await Robot.findOne({ robotId: req.params.robotId }).populate("users");
        if (!robot) return res.status(404).json({ message: "Robot not found" });

        return res.status(200).json(robot.users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
}

const deassignRobotFromUser = async (req, res) => {
    try {
        const { userId, robotId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const robot = await Robot.findById( robotId );
        if (!robot) return res.status(404).json({ message: "Robot not found" });

        if (!robot.users.includes(userId)) {
            return res.status(400).json({ message: "User is not assigned to this robot" });
        }

        robot.users = robot.users.filter(id => id.toString() !== userId);
        await robot.save();
        
        user.robots = user.robots.filter(id => id.toString() !== robot._id.toString());
        await user.save();

        return res.status(200).json({ message: "Robot deassigned successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
};

module.exports = {assignRobottoUser, getAssignedRobots, getAssignedUser, deassignRobotFromUser}