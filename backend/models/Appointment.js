const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Booked", "Cancelled", "Completed"],
      default: "Booked"
    }
  },
  { timestamps: true }
);

appointmentSchema.index({
  doctor: 1,
  appointmentDate: 1,
  appointmentTime: 1,
  status: 1
});

module.exports = mongoose.model("Appointment", appointmentSchema);
