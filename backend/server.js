const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { startReminderScheduler } = require("./services/reminderScheduler");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Basic test route
app.get("/", (req, res) => {
  res.json({
    message: "FCMS API is running",
    project: "Family Clinic Management System",
    student: "Muhammad Usman Aftab - 2529243",
  });
});

// Routes
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FCMS Server running on port ${PORT}`);
  console.log(`Test it: http://localhost:${PORT}`);
  startReminderScheduler();
});
