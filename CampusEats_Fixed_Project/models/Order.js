const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [{
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
    name: String,
    quantity: { type: Number, min: 1, required: true },
    price: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  paymentMethod: { type: String, enum: ["Cash on Delivery", "Demo Online Payment"], required: true },
  paymentStatus: { type: String, enum: ["Pending", "Demo Success"], default: "Pending" },
  orderStatus: { type: String, default: "Placed" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
