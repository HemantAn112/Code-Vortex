const express = require("express");
const { createStaff } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/staff", authMiddleware, roleMiddleware("ADMIN"), createStaff);

module.exports = router;
