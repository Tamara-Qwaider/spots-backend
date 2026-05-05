const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String },
  description: { type: String },
  date: { type: String },
  time: { type: String },
  participantsCount: { type: Number },
  icon: { type: String },
  hostName: { type: String }
});

// تأكدي أن الاسم هنا Activity
module.exports = mongoose.model("Activity", ActivitySchema);