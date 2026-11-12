const router = require("express").Router();
const Order = require("../models/Order");
const Food = require("../models/Food");
const { authRequired } = require("../middleware");

router.post("/", authRequired, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || !items.length || !deliveryAddress || !["Cash on Delivery", "Demo Online Payment"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Add food, delivery details and a payment method." });
    }

    const orderItems = [];
    for (const item of items) {
      const food = await Food.findById(item.foodId);
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      if (!food || !food.available) return res.status(400).json({ message: "One of the selected food items is unavailable." });
      orderItems.push({ food: food._id, name: food.name, quantity, price: food.price });
    }

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total,
      deliveryAddress: String(deliveryAddress).trim(),
      paymentMethod,
      paymentStatus: paymentMethod === "Demo Online Payment" ? "Demo Success" : "Pending"
    });
    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (_err) {
    res.status(500).json({ message: "Could not place order." });
  }
});

router.get("/mine", authRequired, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
