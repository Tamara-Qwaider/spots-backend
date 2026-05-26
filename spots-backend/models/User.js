const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firebaseUID: String,

  name: { type: String, required: true,unique: true, },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: { type: String, required: true },

  emailVerified: {
    type: Boolean,
    default: false,
  },

  interests: [String],

  // الحقول الجديدة لصفحة الـ Profile (تمت إضافتها)
  location: { 
    type: String, 
    default: "" 
  },
  bio: { 
    type: String, 
    default: "No bio added yet." 
  },
  image: { 
    type: String, 
    default: "" 
  },  
  joined: { 
    type: String, 
    default: () => new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' }) 
  },
  isBlocked: {
  type: Boolean,
  default: false,
},

  permissions: {
    createMeetup: {
      type: Boolean,
      default: true,
    },
    joinMeetups: {
      type: Boolean,
      default: true,
    },
  },
  // بدلاً من الـ ObjectId، نستخدم مصفوفة عادية تخزن بيانات المكان كاملة
  savedPlaces: { 
    type: Array, 
    default: [] 
  },

  savedPlacesVisibility: {
  type: String,
  enum: ["public", "private"],
  default: "private",
  },

  role: {
  type: String,
  enum: ["user", "admin"],
  default: "user",
  },
});

module.exports = mongoose.model("User", userSchema);