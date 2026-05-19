const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const placeRoutes = require("./routes/placeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const meetupRoutes = require("./routes/meetupRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📡 طلب جديد وصل للسيرفر: ${req.method} ${req.url}`);
  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/categories", categoryRoutes);

try {
  app.use("/api/users", require("./routes/userRoutes"));
} catch (e) {
  console.log("⚠️ تنبيه: لم يتم العثور على ملف userRoutes أو يحتوي على خطأ داخلي");
}

app.use("/api/meetups", meetupRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

const PORT = 5000;

mongoose
  .connect("mongodb+srv://GP_db_user:Bh8ZUmcmA8Ch2cC1@cluster0.l8gnj0g.mongodb.net/spots-db?retryWrites=true&w=majority")
  .then(() => {
    console.log("MongoDB connected Successfully with latest drivers! ✅🎉");
    app.listen(PORT, () =>
      console.log(`Server running perfectly on port ${PORT} 🚀`)
    );
  })
  .catch((err) => console.log("MongoDB error ❌", err));