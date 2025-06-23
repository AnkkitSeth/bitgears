const Booking = require("../models/Booking");
const Bike = require("../models/Bike");

// Student creates a booking (with overlap prevention)
exports.createBooking = async (req, res) => {
  try {
    const { bikeId, startTime, endTime } = req.body;

    const bike = await Bike.findById(bikeId);
    if (!bike) return res.status(404).json({ message: "Bike not found" });
    if (!bike.isAvailable) return res.status(400).json({ message: "Bike is not available" });

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      bike: bikeId,
      status: { $ne: "cancelled" },
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    if (overlap) {
      return res.status(409).json({
        message: "Bike is already booked during this time. Please choose a different time.",
      });
    }

    const newBooking = new Booking({
      bike: bikeId,
      user: req.user.id,
      startTime,
      endTime,
    });

    await newBooking.save();

    // Mark the bike as unavailable (optional logic)
    bike.isAvailable = false;
    await bike.save();

    res.status(201).json({ message: "Booking successful", booking: newBooking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get bookings of the logged-in student
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("bike", "name brand image pricePerHour")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get bookings for bikes owned by the logged-in owner
exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const bikes = await Bike.find({ owner: ownerId });
    const bikeIds = bikes.map(bike => bike._id);

    const bookings = await Booking.find({ bike: { $in: bikeIds } })
      .populate("bike", "name brand pricePerHour")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    // Marking bike available again
    await Bike.findByIdAndUpdate(booking.bike, { isAvailable: true });

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
