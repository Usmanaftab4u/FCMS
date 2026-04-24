const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/Patient");
const { sendConfirmation } = require("../services/emailService");

// GET all appointments (admin)
router.get("/", async (req, res) => {
  try {
    const { date, doctorId } = req.query;
    let filter = {};
    if (date) filter.date = date;
    if (doctorId) filter.doctor = doctorId;

    const appointments = await Appointment.find(filter)
      .populate("patient", "name email phone")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
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
      .populate("doctor", "name specialization email phone")
      .sort({ date: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET appointments for a specific doctor
router.get("/doctor/:doctorProfileId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorProfileId,
    })
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST book a new appointment
router.post("/", async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    // Check doctor conflict
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

    // Check patient conflict
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

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointment = new Appointment({
      patient: patientId,
      doctor: doctorId,
      date: date,
      time: time,
      status: "confirmed",
    });

    await appointment.save();

    // Mark slot as unavailable
    const slotIndex = doctor.availableSlots.findIndex(
      (slot) => slot.date === date && slot.time === time,
    );
    if (slotIndex !== -1) {
      doctor.availableSlots[slotIndex].isAvailable = false;
      await doctor.save();
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name specialization email phone");

    // Send confirmation email
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

// PUT cancel appointment - patient, doctor or admin can cancel
router.put("/:id/cancel", async (req, res) => {
  try {
    const { cancelledBy } = req.body;

    const appointment = await Appointment.findById(req.params.id).populate(
      "doctor",
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    appointment.status = "cancelled";
    appointment.cancelledBy = cancelledBy || "admin";
    await appointment.save();

    // Make slot available again
    const doctor = await Doctor.findById(appointment.doctor._id);
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
      message: "Appointment cancelled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT doctor changes slot time for a specific appointment
router.put("/:id/reschedule", async (req, res) => {
  try {
    const { newDate, newTime, doctorProfileId } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check new slot is not already booked
    const conflict = await Appointment.findOne({
      doctor: appointment.doctor,
      date: newDate,
      time: newTime,
      status: "confirmed",
      _id: { $ne: appointment._id },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "The new time slot is already booked",
      });
    }

    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      // Free old slot
      const oldSlot = doctor.availableSlots.findIndex(
        (s) => s.date === appointment.date && s.time === appointment.time,
      );
      if (oldSlot !== -1) {
        doctor.availableSlots[oldSlot].isAvailable = true;
      }

      // Book new slot
      const newSlot = doctor.availableSlots.findIndex(
        (s) => s.date === newDate && s.time === newTime,
      );
      if (newSlot !== -1) {
        doctor.availableSlots[newSlot].isAvailable = false;
      }

      await doctor.save();
    }

    appointment.date = newDate;
    appointment.time = newTime;
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
