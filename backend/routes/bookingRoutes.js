const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  cancelBooking,
} = require("../controllers/bookingController");

// Student books a bike
router.post("/book", authMiddleware, createBooking);

// Student views their own bookings
router.get("/mine", authMiddleware, getMyBookings);

// Owner views bookings for their bikes
router.get("/owner", authMiddleware, getOwnerBookings);

// Student cancels their booking
router.delete("/:id", authMiddleware, cancelBooking);

module.exports = router;
