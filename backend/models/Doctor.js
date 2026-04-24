const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
});

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    availableSlots: [timeSlotSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", doctorSchema);
