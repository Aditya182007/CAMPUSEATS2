const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  restaurant: { type: String, required: true, trim: true },
  category: { type: String, default: "Meals" },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 1 },
  image: { type: String, default: "" },
  location: { type: String, default: "" },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Food", foodSchema);
