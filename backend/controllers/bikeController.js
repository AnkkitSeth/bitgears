const Bike = require("../models/Bike");
const Booking = require("../models/Booking");

// Add a new bike using image URL
exports.addBike = async (req, res) => {
  try {
    const { name, brand, pricePerHour, image } = req.body;

    if (!name || !brand || !pricePerHour || !image) {
      return res.status(400).json({ message: "Please provide all required fields (name, brand, pricePerHour, image URL)." });
    }

    const newBike = new Bike({
      owner: req.user.id,
      name,
      brand,
      image,
      pricePerHour,
    });

    await newBike.save();

    res.status(201).json({ message: "Bike added successfully", bike: newBike });
  } catch (err) {
    console.error("Add bike error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all available bikes for students
exports.getAvailableBikes = async (req, res) => {
  try {
    const { name, brand, startTime, endTime } = req.query;

    const filter = { isAvailable: true };
    if (name) filter.name = { $regex: name, $options: "i" };
    if (brand) filter.brand = { $regex: brand, $options: "i" };

    let bikes = await Bike.find(filter).populate("owner", "name email");

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const bookedBikes = await Booking.find({
        status: { $ne: "cancelled" },
        $or: [
          {
            startTime: { $lt: end },
            endTime: { $gt: start },
          },
        ],
      }).distinct("bike");

      bikes = bikes.filter(b => !bookedBikes.includes(b._id.toString()));
    }

    res.status(200).json(bikes);
  } catch (err) {
    console.error("Error fetching available bikes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Toggle bike availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const bike = await Bike.findById(id);

    if (!bike) return res.status(404).json({ message: "Bike not found" });

    if (bike.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    bike.isAvailable = !bike.isAvailable;
    await bike.save();

    res.status(200).json({ message: "Availability updated", isAvailable: bike.isAvailable });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  Get bikes owned by the logged-in owner
exports.getBikesByOwner = async (req, res) => {
  try {
    const bikes = await Bike.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(bikes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  Delete a bike (only if not booked actively)
exports.deleteBike = async (req, res) => {
  try {
    const { id } = req.params;

    const bike = await Bike.findById(id);
    if (!bike) {
      return res.status(404).json({ message: "Bike not found" });
    }

    if (bike.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this bike" });
    }

    const activeBooking = await Booking.findOne({
      bike: id,
      status: { $ne: "cancelled" },
    });

    if (activeBooking) {
      return res.status(400).json({ message: "Cannot delete bike with active bookings" });
    }

    await bike.deleteOne();

    res.status(200).json({ message: "Bike deleted successfully" });
  } catch (err) {
    console.error("Delete bike error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
