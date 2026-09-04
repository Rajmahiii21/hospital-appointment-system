const express = require("express");
const {
  createAppointment,
  getAppointments,
  cancelAppointment,
  completeAppointment
} = require("../controllers/appointmentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createAppointment);
router.get("/", authMiddleware, getAppointments);
router.put("/:id/cancel", authMiddleware, cancelAppointment);
router.put("/:id/complete", authMiddleware, completeAppointment);

module.exports = router;
