const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  location: String,
  rating: Number,
  description: String,
  images: [String],
});

module.exports = mongoose.model("Place", placeSchema);