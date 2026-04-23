const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const { sendReminder } = require("./emailService");

function startReminderScheduler() {
  // Runs every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running daily reminder check...");

    try {
      // Get tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      // Find all confirmed appointments for tomorrow
      // that have not had a reminder sent yet
      const appointments = await Appointment.find({
        date: tomorrowStr,
        status: "confirmed",
        reminderSent: false,
      })
        .populate("patient", "name email")
        .populate("doctor", "name");

      console.log(`Found ${appointments.length} appointments for tomorrow`);

      for (const appt of appointments) {
        try {
          await sendReminder(
            appt.patient.email,
            appt.patient.name,
            appt.doctor.name,
            appt.date,
            appt.time,
          );
          // Mark reminder as sent
          appt.reminderSent = true;
          await appt.save();
        } catch (err) {
          console.log(
            `Failed to send reminder for appointment ${appt._id}:`,
            err.message,
          );
        }
      }
    } catch (err) {
      console.log("Reminder scheduler error:", err.message);
    }
  });

  console.log("Reminder scheduler started — runs daily at 8:00 AM");
}

module.exports = { startReminderScheduler };
