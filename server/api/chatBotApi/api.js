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

router.post('/userSignup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, role, status: "pending" });

        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: "New User Signup - Approval Needed",
            text: `A new user (${email}) has signed up and needs approval.`,
        });

        return res.status(201).json({ message: "Signup successful! Waiting for admin approval." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Signup error", error });
    }
})

router.post('/robot/register', authenticate, async (req, res) => {
    try {
        const { robotName, robotId, ram, cpu, rom, manufacturer, yearOfManufacture } = req.body;

        if (!robotName || !robotId || !ram || !cpu || !rom || !manufacturer || !yearOfManufacture) {
            return res.status(400).json({ message: "All fields are required" });
        }

        let existingRobot = await Robot.findOne({ robotId });
        if (existingRobot) return res.status(400).json({ message: "Robot ID already exists" });

        const robot = new Robot({
            robotName,
            robotId,
            ram,
            cpu,
            rom,
            manufacturer,
            yearOfManufacture
        });
        
        await robot.save();
        return res.status(201).json({ message: "Robot registered successfully!", robot });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Robot registration failed", error: error.message });
    }
});

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