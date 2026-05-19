const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();



const authRoutes = require("./routes/authRoutes");
const placeRoutes = require("./routes/placeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const app = express();

// 1. الميدل وير الأساسي
app.use(cors());
app.use(express.json());
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/categories", categoryRoutes);


// 2. طباعة أي طلب يصل للسيرفر (لمراقبة الروابط والتأكد من عملها)
app.use((req, res, next) => {
  console.log(`📡 طلب جديد: ${req.method} ${req.url}`);
  next();
});

// 3. المسارات (Routes)
app.use("/api/users", require("./routes/userRoutes"));      // للبروفايل والتعديل (Profile/Update)
app.use("/api/activities", require("./routes/activityRoutes")); // للأنشطة
app.use("/api/meetups", require("./routes/meetupRoutes"));  // ⬅️ إضافة مسار الميت آب الجديد

// 4. إعداد مجلد الصور (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. الاتصال بقاعدة البيانات وتشغيل السيرفر
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
  })
  .catch(err => console.log("MongoDB error ❌", err));