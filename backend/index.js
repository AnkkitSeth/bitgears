const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();

// Connect to MongoDB Atlas
connectDB();

// Middlewares
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded images

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/test", require("./routes/protectedTest"));
app.use("/api/bikes", require("./routes/bikeRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

// Serve frontend build after API routes
app.use(express.static(path.join(__dirname, "build")));

// Serve React frontend for all non-API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
