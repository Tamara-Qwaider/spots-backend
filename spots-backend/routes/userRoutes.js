const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const User = require("../models/User");

// 1. إعداد Multer (رفع الصور)
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

// 2. GET PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// 3. UPDATE PROFILE (حل مشكلة الإضافة الذكية)
router.put("/profile/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, location, bio, interests, savedPlaces, newPlace } = req.body;
    let query = { $set: {} };

    // تحديث البيانات الأساسية
    if (name) query.$set.name = name;
    if (location) query.$set.location = location;
    if (bio) query.$set.bio = bio;
    if (interests) query.$set.interests = typeof interests === "string" ? JSON.parse(interests) : interests;
    
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      query.$set.image = `${baseUrl}/uploads/${req.file.filename}`;
    }
    
    // مثال في ملف routes/users.js
    router.get("/", async (req, res) => {
     const users = await User.find({}, "name image"); // جلب الاسم والصورة فقط
      res.json(users);
     });

    // منطق تحديث الأماكن:
    // إذا كان هناك "newPlace" نقوم بالإضافة للمصفوفة القديمة
    if (newPlace) {
      const placeObj = typeof newPlace === "string" ? JSON.parse(newPlace) : newPlace;
      query.$addToSet = { savedPlaces: placeObj };
    } 
    // إذا كان هناك "savedPlaces" (مصفوفة) نقوم باستبدالها (تستخدم عند الحذف)
    else if (savedPlaces) {
      query.$set.savedPlaces = typeof savedPlaces === "string" ? JSON.parse(savedPlaces) : savedPlaces;
    }

    // تنظيف الكائن إذا كان فارغاً
    if (Object.keys(query.$set).length === 0) delete query.$set;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      query,
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed: " + err.message });
  }
});

module.exports = router;