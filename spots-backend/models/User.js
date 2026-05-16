const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // الحقول الأساسية (لم تتغير)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  interests: [String],

  // الحقول الجديدة لصفحة الـ Profile (تمت إضافتها)
  location: { 
    type: String, 
    default: "Amman, Jordan" 
  },
  bio: { 
    type: String, 
    default: "No bio added yet." 
  },
  image: { 
    type: String, 
    default: "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?auto=format&fit=crop&w=500&q=80" 
  },
  joined: { 
    type: String, 
    default: () => new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' }) 
  },
  // بدلاً من الـ ObjectId، نستخدم مصفوفة عادية تخزن بيانات المكان كاملة
  savedPlaces: { 
    type: Array, 
    default: [] 
  },
});

module.exports = mongoose.model("User", userSchema);