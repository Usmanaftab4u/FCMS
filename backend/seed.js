const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/Patient");
const Doctor = require("./models/Doctor");

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Doctor.deleteMany({});
    await User.deleteMany({ role: "doctor" });
    console.log("Cleared existing doctors");

    const hashedPassword = await bcrypt.hash("doctor123", 10);

    const doctorUsers = [
      {
        name: "Dr. Ahmed Khan",
        email: "ahmed.khan@fcms.com",
        phone: "03001234567",
        password: hashedPassword,
        role: "doctor",
        specialization: "General Practitioner",
      },
      {
        name: "Dr. Sara Malik",
        email: "sara.malik@fcms.com",
        phone: "03009876543",
        password: hashedPassword,
        role: "doctor",
        specialization: "Pediatrician",
      },
      {
        name: "Dr. Bilal Hassan",
        email: "bilal.hassan@fcms.com",
        phone: "03331234567",
        password: hashedPassword,
        role: "doctor",
        specialization: "Cardiologist",
      },
    ];

    for (const doctorData of doctorUsers) {
      const user = new User(doctorData);
      await user.save();

      const slots = [
        { date: "2026-04-24", time: "09:00 AM", isAvailable: true },
        { date: "2026-04-24", time: "10:00 AM", isAvailable: true },
        { date: "2026-04-24", time: "11:00 AM", isAvailable: true },
        { date: "2026-04-24", time: "02:00 PM", isAvailable: true },
        { date: "2026-04-25", time: "09:00 AM", isAvailable: true },
        { date: "2026-04-25", time: "10:00 AM", isAvailable: true },
        { date: "2026-04-25", time: "11:00 AM", isAvailable: true },
        { date: "2026-04-26", time: "09:00 AM", isAvailable: true },
        { date: "2026-04-26", time: "10:00 AM", isAvailable: true },
      ];

      const doctorProfile = new Doctor({
        user: user._id,
        name: user.name,
        specialization: user.specialization,
        email: user.email,
        phone: user.phone,
        availableSlots: slots,
      });

      await doctorProfile.save();
      console.log(`Created doctor: ${user.name}`);
    }

    console.log("Database seeded successfully");
    console.log("Doctor login password: doctor123");
    process.exit(0);
  } catch (error) {
    console.log("Seed error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
