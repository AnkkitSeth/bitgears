const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  image: {
    type: String, 
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  pricePerHour: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Bike", bikeSchema);
