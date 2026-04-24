const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/Patient");

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await User.deleteOne({ email: "admin@fcms.com" });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = new User({
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

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
