const router = require("express").Router();
const Food = require("../models/Food");
const { authRequired } = require("../middleware");

router.get("/", async (req, res) => {
  try {
    const filter = { available: true };
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.search) {
      const q = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: q }, { restaurant: q }, { description: q }, { location: q }];
    }
    res.json(await Food.find(filter).sort({ restaurant: 1, name: 1 }));
  } catch (_err) {
    res.status(500).json({ message: "Could not load food items." });
  }
});

// Demo contribution form: logged-in users can add a menu item.
router.post("/", authRequired, async (req, res) => {
  try {
    const { name, restaurant, category, description, price, image, location } = req.body;
    if (!name || !restaurant || !Number.isFinite(Number(price)) || Number(price) < 1) {
      return res.status(400).json({ message: "Food name, restaurant and a valid price are required." });
    }
    const food = await Food.create({ name, restaurant, category, description, price: Number(price), image, location });
    res.status(201).json(food);
  } catch (_err) {
    res.status(400).json({ message: "Could not add this food item." });
  }
});

module.exports = router;
