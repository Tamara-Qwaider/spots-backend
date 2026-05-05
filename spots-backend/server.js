const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// 1. الميدل وير الأساسي
app.use(cors());
app.use(express.json());

// 2. طباعة أي طلب يصل للسيرفر (لمراقبة الروابط والتأكد من عملها)
app.use((req, res, next) => {
  console.log(`📡 طلب جديد: ${req.method} ${req.url}`);
  next();
});

// 3. المسارات (Routes)
// تم فصل الـ Auth عن الـ Users كما طلبتِ
app.use("/api/auth", require("./routes/authRoutes"));     // للمصادقة (Login/Signup)
app.use("/api/users", require("./routes/userRoutes"));    // للبروفايل والتعديل (Profile/Update)
app.use("/api/places", require("./routes/placeRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));

// 4. إعداد مجلد الصور (Uploads)
// السطر التالي يضمن أن الروابط مثل http://localhost:5000/uploads/image.jpg تعمل
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. الاتصال بقاعدة البيانات وتشغيل السيرفر
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
  })
  .catch(err => console.log("MongoDB error ❌", err));