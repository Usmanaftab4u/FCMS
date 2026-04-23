const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// GET all doctors with available slots
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new doctor (admin only)
router.post("/", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update doctor availability
router.put("/:id/slots", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    doctor.availableSlots = req.body.availableSlots;
    await doctor.save();
    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE remove a specific slot
router.delete("/:doctorId/slots/:slotId", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }
    doctor.availableSlots = doctor.availableSlots.filter(
      (slot) => slot._id.toString() !== req.params.slotId,
    );
    await doctor.save();
    res.json({ success: true, message: "Slot removed", data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
