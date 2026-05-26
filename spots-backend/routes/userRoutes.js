const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const User = require("../models/User");
const Meetup = require("../models/Meetup");
const protect = require("../middleware/authMiddleware");

// إعداد CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});



// GET ALL USERS
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// GET MUTUAL INTEREST USERS
router.get("/mutual/:userId", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId).select(
      "name interests location"
    );

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentInterests = currentUser.interests || [];

    if (currentInterests.length === 0) {
      return res.json([]);
    }

    const users = await User.find({
      _id: { $ne: req.params.userId },
      isBlocked: { $ne: true },
      interests: { $in: currentInterests },
    }).select("name image interests location");

    const suggestions = users
      .map((user) => {
        const sharedInterests = (user.interests || []).filter((interest) =>
          currentInterests.includes(interest)
        );

        const sameLocation =
          currentUser.location &&
          user.location &&
          currentUser.location.toLowerCase().trim() ===
            user.location.toLowerCase().trim();

        const score = sharedInterests.length + (sameLocation ? 2 : 0);

        return {
          _id: user._id,
          name: user.name,
          image: user.image,
          location: user.location,
          sharedInterests,
          sameLocation,
          score,
        };
      })
      .filter((user) => user.sharedInterests.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch mutual interest users",
      error: err.message,
    });
  }
});

// GET PROFILE
router.get("/profile/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// UPDATE PROFILE
router.put("/profile/update/:id", protect, upload.single("image"), async (req, res) => {
  try {
    const { name, location, bio, interests, savedPlaces, newPlace,savedPlacesVisibility } = req.body;
    let query = { $set: {} };

    if (name) query.$set.name = name;
    if (location) query.$set.location = location;
    if (bio) query.$set.bio = bio;
    if (interests) {
      query.$set.interests =
        typeof interests === "string" ? JSON.parse(interests) : interests;
    }
    if (savedPlacesVisibility) {
      query.$set.savedPlacesVisibility = savedPlacesVisibility;
    }

    if (req.file) {
      query.$set.image = req.file.path;
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
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Meetup.deleteMany({
      createdBy: user.name,
    });

    await Meetup.updateMany(
      {},
      {
        $pull: {
          attendees: user.name,
          invitedPeople: user.name,
        },
      }
    );

    await User.findByIdAndDelete(userId);


    res.json({ message: "User deleted successfully and removed from meetups" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed: " + err.message });
  }
});
// BLOCK / UNBLOCK USER
router.put("/:id/block", protect, async (req, res) => {
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
router.put("/:id/permissions", protect, async (req, res) => {
  try {
    const { createMeetup, joinMeetups } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        permissions: {
          createMeetup,
          joinMeetups,
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