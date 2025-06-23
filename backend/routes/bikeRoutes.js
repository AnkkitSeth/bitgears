const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  addBike,
  getAvailableBikes,
  getBikesByOwner,
  toggleAvailability,
  deleteBike,
} = require("../controllers/bikeController");

// Get bikes listed by the logged-in owner
router.get("/", authMiddleware, getBikesByOwner);

// Add a new bike using image
router.post("/add", authMiddleware, addBike);

// Get available bikes (for students)
router.get("/available", getAvailableBikes);

// Toggle availability of a bike
router.patch("/toggle/:id", authMiddleware, toggleAvailability);

// Delete a bike (only if not actively booked)
router.delete("/:id", authMiddleware, deleteBike);

module.exports = router;
