const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Get notifications for user
router.get("/:userName", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userName: req.params.userName
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Mark notification as read
router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ message: "Error updating notification" });
  }
});

// Delete notification
router.delete("/:id", async (req, res) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(
      req.params.id
    );

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: "Error deleting notification" });
  }
});

module.exports = router;