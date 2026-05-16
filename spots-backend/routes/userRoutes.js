const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const User = require("../models/User");

// إعداد Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// GET PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// UPDATE PROFILE
router.put("/profile/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, location, bio, interests, savedPlaces, newPlace } = req.body;
    let query = { $set: {} };

    if (name) query.$set.name = name;
    if (location) query.$set.location = location;
    if (bio) query.$set.bio = bio;
    if (interests) {
      query.$set.interests =
        typeof interests === "string" ? JSON.parse(interests) : interests;
    }

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      query.$set.image = `${baseUrl}/uploads/${req.file.filename}`;
    }

    if (newPlace) {
      const placeObj = typeof newPlace === "string" ? JSON.parse(newPlace) : newPlace;
      query.$addToSet = { savedPlaces: placeObj };
    } else if (savedPlaces) {
      query.$set.savedPlaces =
        typeof savedPlaces === "string" ? JSON.parse(savedPlaces) : savedPlaces;
    }

    if (Object.keys(query.$set).length === 0) delete query.$set;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, query, {
      new: true,
    }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed: " + err.message });
  }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed: " + err.message });
  }
});
// BLOCK / UNBLOCK USER
router.put("/:id/block", async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User block status updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// BLOCK / UNBLOCK USER
router.put("/:id/block", async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User block status updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE USER PERMISSIONS
router.put("/:id/permissions", async (req, res) => {
  try {
    const { createMeetup, addOthers } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        permissions: {
          createMeetup,
          addOthers,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Permissions updated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;