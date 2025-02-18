const express = require("express");
const router = express.Router();
const { approveUser, rejectUser } = require("../controllers/admin.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.patch("/approve", approveUser);
router.patch("/reject", rejectUser);

module.exports = router;
