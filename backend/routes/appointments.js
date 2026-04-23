const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const { sendConfirmation } = require("../services/emailService");

// GET all appointments (admin dashboard)
router.get("/", async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    let filter = {};
    if (date) filter.date = date;
    if (doctorId) filter.doctor = doctorId;

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET appointments for a specific patient
router.get("/patient/:patientId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
    })
      .populate("doctor", "name specialization")
      .sort({ date: 1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST book a new appointment (with double booking prevention)
router.post("/", async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    // Check for double booking - same doctor same slot
    const doctorConflict = await Appointment.findOne({
      doctor: doctorId,
      date: date,
      time: time,
      status: "confirmed",
    });

    if (doctorConflict) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked. Please choose another slot.",
      });
    }

    // Check if patient already has appointment at same date and time
    const patientConflict = await Appointment.findOne({
      patient: patientId,
      date: date,
      time: time,
      status: "confirmed",
    });

    if (patientConflict) {
      return res.status(409).json({
        success: false,
        message: "You already have an appointment at this date and time.",
      });
    }

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Create the appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date: date,
      time: time,
      status: "confirmed",
    });

    await appointment.save();

    // Mark slot as unavailable in doctor model
    const slotIndex = doctor.availableSlots.findIndex(
      (slot) => slot.date === date && slot.time === time,
    );
    if (slotIndex !== -1) {
      doctor.availableSlots[slotIndex].isAvailable = false;
      await doctor.save();
    }

    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization");

    // Send confirmation email (don't await — don't block the response)
    sendConfirmation(
      populatedAppointment.patient.email,
      populatedAppointment.patient.name,
      populatedAppointment.doctor.name,
      populatedAppointment.date,
      populatedAppointment.time,
    ).catch((err) => console.log("Email error:", err.message));

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully. Confirmation email sent.",
      data: populatedAppointment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked. Please choose another slot.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT cancel an appointment
router.put("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }
    appointment.status = "cancelled";
    await appointment.save();

    // Make slot available again
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      const slotIndex = doctor.availableSlots.findIndex(
        (slot) =>
          slot.date === appointment.date && slot.time === appointment.time,
      );
      if (slotIndex !== -1) {
        doctor.availableSlots[slotIndex].isAvailable = true;
        await doctor.save();
      }
    }

    res.json({
      success: true,
      message: "Appointment cancelled",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
