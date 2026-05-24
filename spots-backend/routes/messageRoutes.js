const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get messages for one meetup
router.get("/:meetupId", async (req, res) => {
  try {
    const messages = await Message.find({
      meetupId: req.params.meetupId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Save new message
router.post("/", async (req, res) => {
  try {
    const { meetupId, senderId, senderName, text } = req.body;

    if (!meetupId || !senderName || !text) {
      return res.status(400).json({ message: "Missing message data" });
    }

    const message = await Message.create({
      meetupId,
      senderId,
      senderName,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});
//delete message
router.delete("/:id", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    res.json({
      message: "Message deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;