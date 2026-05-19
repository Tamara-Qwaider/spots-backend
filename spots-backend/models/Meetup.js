const mongoose = require("mongoose");

const meetupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  img: { type: String, default: "https://picsum.photos/400/250" },
  attendees: [{id: String,name: String,},
], // مصفوفة أسماء المشاركين
  invitedPeople: [{ type: String }],
  notes: { type: String },
  createdBy: {id: String,name: String,},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Meetup", meetupSchema);