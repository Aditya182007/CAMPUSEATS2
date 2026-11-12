require("dotenv").config();
const mongoose = require("mongoose");
const Food = require("./models/Food");

const sampleFoods = [
  { name: "Veg Fried Rice", restaurant: "Campus Corner Kitchen", category: "Meals", description: "A filling rice meal with vegetables.", price: 110, location: "Near Kristu Jayanti University" },
  { name: "Paneer Roll", restaurant: "North Gate Rolls", category: "Fast Food", description: "Paneer, salad and sauce wrapped in a soft roll.", price: 90, location: "Kothanur, Bengaluru" },
  { name: "Masala Dosa", restaurant: "Udupi Breakfast Point", category: "Meals", description: "Crispy dosa served with chutney and sambar.", price: 80, location: "Near Kristu Jayanti University" },
  { name: "Cold Coffee", restaurant: "The Study Cafe", category: "Cafe", description: "Chilled coffee for a study break.", price: 95, location: "Kothanur, Bengaluru" },
  { name: "French Fries", restaurant: "North Gate Rolls", category: "Snacks", description: "Crispy salted potato fries.", price: 75, location: "Kothanur, Bengaluru" },
  { name: "Lime Soda", restaurant: "The Study Cafe", category: "Drinks", description: "Refreshing sweet or salted lime soda.", price: 45, location: "Near Kristu Jayanti University" }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campuseats");
  await Food.deleteMany({});
  await Food.insertMany(sampleFoods);
  console.log("Sample menu inserted. These are demo entries; verify real vendors, prices and locations before use.");
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err); process.exit(1); });
