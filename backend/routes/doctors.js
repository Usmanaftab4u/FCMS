const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// GET all doctors with available slots
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate(
      "user",
      "name email specialization",
    );
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET doctor profile by user ID
router.get("/by-user/:userId", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.userId }).populate(
      "user",
      "name email specialization",
    );
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single doctor by profile ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "user",
      "name email specialization",
    );
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create doctor profile (admin only)
router.post("/", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update doctor slots
router.put("/:id/slots", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    doctor.availableSlots = req.body.availableSlots;
    await doctor.save();
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST add a single slot to doctor
router.post("/:id/slots", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const { date, time } = req.body;

    // Check if slot already exists
    const exists = doctor.availableSlots.find(
      (s) => s.date === date && s.time === time,
    );
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This slot already exists",
      });
    }

    doctor.availableSlots.push({ date, time, isAvailable: true });
    await doctor.save();

    res.json({
      success: true,
      message: "Slot added successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE remove a specific slot
router.delete("/:doctorId/slots/:slotId", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    doctor.availableSlots = doctor.availableSlots.filter(
      (slot) => slot._id.toString() !== req.params.slotId,
    );
    await doctor.save();
    res.json({
      success: true,
      message: "Slot removed successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
