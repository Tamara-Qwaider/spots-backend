const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  meetupId: { type: String },
  meetupTitle: { type: String },
  type: { type: String, enum: ["edit", "delete"], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);