const Appointment = require("../models/Appointment");
const User = require("../models/User");

const populateAppointment = (query) =>
  query
    .populate(
      "doctor",
      "name email phone specialization experience qualification consultationFee"
    )
    .populate("patient", "name email phone");

const createAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book appointments" });
    }

    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: "Doctor, appointment date and appointment time are required"
      });
    }

    const dateOnly = new Date(appointmentDate);
    if (Number.isNaN(dateOnly.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly < today) {
      return res.status(400).json({ message: "Appointment date cannot be in the past" });
    }

    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: dateOnly,
      appointmentTime,
      status: "Booked"
    });

    if (existing) {
      return res.status(400).json({
        message: "This appointment slot is already booked"
      });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      appointmentDate: dateOnly,
      appointmentTime,
      reason,
      status: "Booked"
    });

    const populated = await populateAppointment(
      Appointment.findById(appointment._id)
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populated
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create appointment",
      error: error.message
    });
  }
};

const getAppointments = async (req, res) => {
  try {
    const filter =
      req.user.role === "patient"
        ? { patient: req.user.id }
        : { doctor: req.user.id };

    const appointments = await populateAppointment(
      Appointment.find(filter).sort({ appointmentDate: 1, appointmentTime: 1 })
    );

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const owner =
      (req.user.role === "patient" &&
        appointment.patient.toString() === req.user.id) ||
      (req.user.role === "doctor" &&
        appointment.doctor.toString() === req.user.id);

    if (!owner) {
      return res.status(403).json({ message: "You cannot cancel this appointment" });
    }

    if (appointment.status === "Cancelled") {
      return res.status(400).json({ message: "Appointment is already cancelled" });
    }

    if (appointment.status === "Completed") {
      return res.status(400).json({
        message: "Completed appointments cannot be cancelled"
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    res.json({
      message: "Appointment cancelled successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
};

const completeAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Only doctors can complete appointments" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only complete your own appointments"
      });
    }

    if (appointment.status === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled appointments cannot be completed"
      });
    }

    if (appointment.status === "Completed") {
      return res.status(400).json({
        message: "Appointment is already completed"
      });
    }

    appointment.status = "Completed";
    await appointment.save();

    res.json({
      message: "Appointment completed successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete appointment" });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  cancelAppointment,
  completeAppointment
};
