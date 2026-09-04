const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ["patient", "doctor"], required: true },
    specialization: { type: String, trim: true, default: "" },
    experience: { type: Number, default: 0, min: 0 },
    qualification: { type: String, trim: true, default: "" },
    consultationFee: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
