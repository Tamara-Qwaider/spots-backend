const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const placeRoutes = require("./routes/placeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const meetupRoutes = require("./routes/meetupRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// 🛠️ Logger
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// 🗂️ Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// 📌 API ROUTES
// =========================

app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/categories", categoryRoutes);

try {
  app.use("/api/users", require("./routes/userRoutes"));
} catch (e) {
  console.log("⚠️ userRoutes not found or has error");
}

app.use("/api/meetups", meetupRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

// =========================
// 🚀 SERVER START
// =========================

const PORT = 5000;

mongoose
  .connect(
    "mongodb+srv://GP_db_user:Bh8ZUmcmA8Ch2cC1@cluster0.l8gnj0g.mongodb.net/spots-db?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("MongoDB connected Successfully ✅");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} 🚀`)
    );
  })
  .catch((err) => console.log("MongoDB error ❌", err));