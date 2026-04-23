const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Patient = require("./models/Patient");

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Delete existing admin if any
  await Patient.deleteOne({ email: "admin@fcms.com" });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new Patient({
    name: "Admin",
    email: "admin@fcms.com",
    phone: "03000000000",
    password: hashedPassword,
    role: "admin",
  });

  await admin.save();
  console.log("Admin created successfully");
  console.log("Email: admin@fcms.com");
  console.log("Password: admin123");
  process.exit(0);
}

createAdmin().catch(console.error);
