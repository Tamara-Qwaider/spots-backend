const express = require("express");
const router = express.Router();
const Place = require("../models/Place");

// GET all places
router.get("/", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD new place
router.post("/", async (req, res) => {
  try {
    const { name, category, image, location, rating, description, images } =
      req.body;

    const newPlace = new Place({
      name,
      category,
      image,
      location,
      rating,
      description,
      images: images || [],
    });

    await newPlace.save();

    res.status(201).json({
      message: "Place added successfully",
      place: newPlace,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;