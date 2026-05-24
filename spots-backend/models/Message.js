const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    meetupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meetup",
      required: true,
    },
    senderId: {
      type: String,
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
    readBy: [
  {
    type:  String,
   
  },
],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);