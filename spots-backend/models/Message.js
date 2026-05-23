const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    meetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meetup",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);