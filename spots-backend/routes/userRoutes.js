const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const User = require("../models/User");

// ==========================================
// 1. إعداد Multer (رفع الصور)
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// ==========================================
// 2. GET PROFILE (جلب بيانات البروفايل)
// ==========================================
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("savedPlaces");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// ==========================================
// 3. UPDATE PROFILE (تحديث البيانات والصورة)
// ==========================================
router.put("/profile/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, location, bio, interests } = req.body;
    let updateFields = {};

    if (name) updateFields.name = name;
    if (location) updateFields.location = location;
    if (bio) updateFields.bio = bio;

    if (interests) {
      try {
        updateFields.interests = typeof interests === "string" ? JSON.parse(interests) : interests;
      } catch (e) {
        updateFields.interests = interests;
      }
    }

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      updateFields.image = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Update failed: " + err.message });
  }
});

module.exports = router;