const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  phone: user.phone,
  role: user.role,
  specialization: user.specialization,
  experience: user.experience,
  qualification: user.qualification,
  consultationFee: user.consultationFee
});

const register = async (req, res) => {
  try {
    const {
      name, username, email, password, confirmPassword, phone, role,
      specialization, experience, qualification, consultationFee
    } = req.body;

    if (!name || !username || !email || !password || !phone || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "doctor" && (!specialization || !qualification)) {
      return res.status(400).json({
        message: "Specialization and qualification are required for doctors"
      });
    }

    if (await User.findOne({ username })) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      username,
      email,
      password: await bcrypt.hash(password, 10),
      phone,
      role,
      specialization: role === "doctor" ? specialization : "",
      experience: role === "doctor" ? Number(experience || 0) : 0,
      qualification: role === "doctor" ? qualification : "",
      consultationFee: role === "doctor" ? Number(consultationFee || 0) : 0
    });

    res.status(201).json({
      message: "Registration successful",
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

module.exports = { register, login, me };
