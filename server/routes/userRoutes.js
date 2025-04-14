const express = require("express");
const router = express.Router();
const { signup, login, getAllUsers, updateUser, addUser } = require("../controllers/user.controller");

router.post("/signup", signup);
router.post("/login", login);
router.get("/user", getAllUsers);
router.put("/updateUser/:userId", updateUser)
router.post("/addUser", addUser);

module.exports = router;
