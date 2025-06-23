const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bike: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bike",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["booked", "cancelled"],
    default: "booked"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
