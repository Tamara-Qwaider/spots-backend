const mongoose = require("mongoose");

const meetupSchema = new mongoose.Schema({
  // Meetup title
  title: {
    type: String,
    required: true,
  },

  // Meetup location
  location: {
    type: String,
    required: true,
  },

  // Date stored as String for compatibility
  date: {
    type: String,
    required: true,
  },

  // Time stored as String for compatibility
  time: {
    type: String,
    required: true,
  },

  // Meetup image
  img: {
    type: String,
    default: "https://picsum.photos/400/250",
  },

  // Joined users
  attendees: [
    {
      type: String,
    },
  ],

  // Invited users
  invitedPeople: [
    {
      type: String,
    },
  ],

  // Extra meetup notes
  notes: {
    type: String,
    default: "",
  },

  // 🔥 meetup category for recommendation system
category: {
  type: String,
  default: "",
},

  // Meetup creator
  createdBy: {
    type: String,
    required: true,
  },

  // Maximum participants
  maxParticipants: {
    type: Number,
    default: 10,
  },

  // Meetup creation date
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // 🔥 Auto delete after meetup ends
  expiresAt: {
    type: Date,
    required: true,
  },

  status: {
  type: String,
  enum: ["active", "expired", "cancelled"],
  default: "active",
}
});


module.exports = mongoose.model("Meetup", meetupSchema);