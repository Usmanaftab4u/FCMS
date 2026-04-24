const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Patient");
const Doctor = require("../models/Doctor");

// POST register - patient or doctor
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role, specialization, dateOfBirth } =
      req.body;

    // Validate role
    if (!role || !["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either patient or doctor",
      });
    }

    // Doctor must provide specialization
    if (role === "doctor" && !specialization) {
      return res.status(400).json({
        success: false,
        message: "Doctors must provide their specialization",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      specialization: role === "doctor" ? specialization : undefined,
      dateOfBirth: role === "patient" ? dateOfBirth : undefined,
    });

    await user.save();

    // If doctor, create doctor schedule profile automatically
    if (role === "doctor") {
      const doctorProfile = new Doctor({
        user: user._id,
        name: user.name,
        specialization: specialization,
        email: user.email,
        phone: user.phone,
        availableSlots: [],
      });
      await doctorProfile.save();
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      message:
        role === "doctor"
          ? "Doctor account created successfully"
          : "Patient account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // If doctor, get their doctor profile ID
    let doctorProfileId = null;
    if (user.role === "doctor") {
      const doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) {
        doctorProfileId = doctorProfile._id;
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        doctorProfileId: doctorProfileId,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
