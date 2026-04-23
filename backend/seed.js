const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Doctor = require("./models/Doctor");

dotenv.config();

const doctors = [
  {
    name: "Dr. Ahmed Khan",
    specialization: "General Practitioner",
    email: "ahmed.khan@fcms.com",
    phone: "03001234567",
    availableSlots: [
      { date: "2026-04-24", time: "09:00 AM", isAvailable: true },
      { date: "2026-04-24", time: "10:00 AM", isAvailable: true },
      { date: "2026-04-24", time: "11:00 AM", isAvailable: true },
      { date: "2026-04-24", time: "02:00 PM", isAvailable: true },
      { date: "2026-04-24", time: "03:00 PM", isAvailable: true },
      { date: "2026-04-25", time: "09:00 AM", isAvailable: true },
      { date: "2026-04-25", time: "10:00 AM", isAvailable: true },
      { date: "2026-04-25", time: "11:00 AM", isAvailable: true },
    ],
  },
  {
    name: "Dr. Sara Malik",
    specialization: "Pediatrician",
    email: "sara.malik@fcms.com",
    phone: "03009876543",
    availableSlots: [
      { date: "2026-04-24", time: "09:30 AM", isAvailable: true },
      { date: "2026-04-24", time: "10:30 AM", isAvailable: true },
      { date: "2026-04-24", time: "12:00 PM", isAvailable: true },
      { date: "2026-04-25", time: "09:30 AM", isAvailable: true },
      { date: "2026-04-25", time: "10:30 AM", isAvailable: true },
      { date: "2026-04-25", time: "03:00 PM", isAvailable: true },
    ],
  },
  {
    name: "Dr. Bilal Hassan",
    specialization: "Cardiologist",
    email: "bilal.hassan@fcms.com",
    phone: "03331234567",
    availableSlots: [
      { date: "2026-04-24", time: "11:00 AM", isAvailable: true },
      { date: "2026-04-24", time: "01:00 PM", isAvailable: true },
      { date: "2026-04-25", time: "11:00 AM", isAvailable: true },
      { date: "2026-04-25", time: "02:00 PM", isAvailable: true },
      { date: "2026-04-26", time: "09:00 AM", isAvailable: true },
      { date: "2026-04-26", time: "10:00 AM", isAvailable: true },
    ],
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log("Cleared existing doctors");

    // Insert new doctors
    await Doctor.insertMany(doctors);
    console.log("3 doctors added successfully");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.log("Seed error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
