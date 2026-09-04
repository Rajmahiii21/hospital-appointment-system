require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const doctors = [
  ["Dr. Amit Sharma","amitdoc","amit@hospital.com","9876500001","Cardiologist",8,"MBBS, MD Cardiology",700],
  ["Dr. Priya Verma","priyadoc","priya@hospital.com","9876500002","Dermatologist",6,"MBBS, MD Dermatology",600],
  ["Dr. Rahul Mehta","rahuldoc","rahul@hospital.com","9876500003","Dentist",5,"BDS, MDS",500],
  ["Dr. Neha Kapoor","nehadoc","neha@hospital.com","9876500004","Pediatrician",7,"MBBS, MD Pediatrics",650],
  ["Dr. Arjun Singh","arjundoc","arjun@hospital.com","9876500005","Orthopedic",10,"MBBS, MS Orthopedics",800],
  ["Dr. Sneha Patel","snehadoc","sneha@hospital.com","9876500006","General Physician",4,"MBBS",400]
];

const patients = [
  ["Raj Sharma","rajpatient","raj@gmail.com","9893000001"],
  ["Aman Patel","amanpatient","aman@gmail.com","9893000002"],
  ["Riya Verma","riyapatient","riya@gmail.com","9893000003"],
  ["Karan Singh","karanpatient","karan@gmail.com","9893000004"]
];

const futureDate = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const seed = async () => {
  try {
    await connectDB();

    const usernames = [
      ...doctors.map((d) => d[1]),
      ...patients.map((p) => p[1])
    ];

    const oldUsers = await User.find({ username: { $in: usernames } }).select("_id");
    const oldIds = oldUsers.map((u) => u._id);

    await Appointment.deleteMany({
      $or: [
        { patient: { $in: oldIds } },
        { doctor: { $in: oldIds } }
      ]
    });
    await User.deleteMany({ username: { $in: usernames } });

    console.log("Old development seed data cleared");

    const doctorDocs = await User.insertMany(
      await Promise.all(
        doctors.map(async ([name, username, email, phone, specialization, experience, qualification, consultationFee]) => ({
          name, username, email, phone, role: "doctor",
          password: await bcrypt.hash("doctor123", 10),
          specialization, experience, qualification, consultationFee
        }))
      )
    );
    console.log("Doctors inserted successfully");

    const patientDocs = await User.insertMany(
      await Promise.all(
        patients.map(async ([name, username, email, phone]) => ({
          name, username, email, phone, role: "patient",
          password: await bcrypt.hash("patient123", 10)
        }))
      )
    );
    console.log("Patients inserted successfully");

    const D = Object.fromEntries(doctorDocs.map((d) => [d.username, d._id]));
    const P = Object.fromEntries(patientDocs.map((p) => [p.username, p._id]));

    await Appointment.insertMany([
      { patient: P.rajpatient, doctor: D.amitdoc, appointmentDate: futureDate(6), appointmentTime: "10:00 AM", reason: "Regular heart checkup", status: "Booked" },
      { patient: P.amanpatient, doctor: D.priyadoc, appointmentDate: futureDate(7), appointmentTime: "11:00 AM", reason: "Skin consultation", status: "Booked" },
      { patient: P.riyapatient, doctor: D.rahuldoc, appointmentDate: futureDate(3), appointmentTime: "02:00 PM", reason: "Dental checkup", status: "Completed" },
      { patient: P.karanpatient, doctor: D.nehadoc, appointmentDate: futureDate(8), appointmentTime: "03:00 PM", reason: "Child health consultation", status: "Cancelled" },
      { patient: P.rajpatient, doctor: D.arjundoc, appointmentDate: futureDate(10), appointmentTime: "04:00 PM", reason: "Knee pain consultation", status: "Booked" },
      { patient: P.amanpatient, doctor: D.snehadoc, appointmentDate: futureDate(12), appointmentTime: "05:00 PM", reason: "General health checkup", status: "Booked" }
    ]);

    console.log("Appointments inserted successfully");
    console.log("Database seeded successfully");
    await mongoose.connection.close();
  } catch (error) {
    console.error("Seed failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
