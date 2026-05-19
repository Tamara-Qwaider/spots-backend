const mongoose = require("mongoose");

const meetupSchema = new mongoose.Schema({
  title: { type: String, required: true },

  location: { type: String, required: true },

  date: { type: String, required: true },

  time: { type: String, required: true },

  img: {
    type: String,
    default: "https://picsum.photos/400/250"
  },

  attendees: [{ type: String }],

  invitedPeople: [{ type: String }],

  notes: { type: String },

  createdBy: {
    type: String,
    required: true
  },

  maxParticipants: {
    type: Number,
    default: 10
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Meetup", meetupSchema);