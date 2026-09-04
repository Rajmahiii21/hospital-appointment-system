const express = require("express");
const { getDoctors, getPatients } = require("../controllers/userController");
const { authMiddleware, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/doctors", authMiddleware, getDoctors);
router.get("/patients", authMiddleware, allowRoles("doctor"), getPatients);

module.exports = router;
