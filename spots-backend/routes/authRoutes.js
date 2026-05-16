const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User");

// ==========================================
// 1. SIGNUP (تسجيل مستخدم جديد)
// ==========================================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      interests: interests || [],
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        interests: newUser.interests,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup error: " + err.message });
  }
});

// ==========================================
// 2. LOGIN (تسجيل الدخول)
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        interests: user.interests,
        image: user.image,
        isBlocked: user.isBlocked,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error: " + err.message });
  }
});
// هذا الجزء هو المسؤول عن استلام الاهتمامات من الصفحة وحفظها
router.put("/interests", async (req, res) => {
  try {
    const { userId, interests } = req.body;

    // البحث عن المستخدم وتحديث قائمة اهتماماته
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { interests: interests } },
      { new: true } // ليعيد لنا البيانات الجديدة بعد التحديث
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Interests updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

router.put("/verify-email", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Email verified successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;