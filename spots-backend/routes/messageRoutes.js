const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Meetup = require("../models/Meetup");

// Get unread counts grouped by active meetup only
router.get("/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();

    const activeMeetups = await Meetup.find({
      status: "active",
      expiresAt: { $gt: now },
    }).select("_id");

    const activeMeetupIds = activeMeetups.map((m) => m._id);

    const unreadMessages = await Message.find({
      meetupId: { $in: activeMeetupIds },
      senderId: { $ne: userId },
      readBy: { $ne: userId },
    });

    const counts = {};

    unreadMessages.forEach((msg) => {
      const meetupId = msg.meetupId.toString();
      counts[meetupId] = (counts[meetupId] || 0) + 1;
    });

    res.json(counts);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

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
      readBy: senderId ? [senderId] : [],
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Mark messages as read
router.put("/read/:meetupId", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    await Message.updateMany(
      {
        meetupId: req.params.meetupId,
        readBy: { $ne: userId },
      },
      {
        $push: {
          readBy: userId,
        },
      }
    );

    res.json({
      message: "Messages marked as read",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
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