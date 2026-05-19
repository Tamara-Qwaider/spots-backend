const express = require("express");
const router = express.Router();
const Meetup = require("../models/Meetup");
const protect = require("../middleware/authMiddleware");

// 1. جلب كل اللقاءات
router.get("/", protect, async (req, res) => {
  try {
    const meetups = await Meetup.find().sort({ createdAt: -1 });
    res.json(meetups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. إنشاء لقاء جديد
router.post("/create", protect, async (req, res) => {
  const meetup = new Meetup(req.body);
  try {
    const newMeetup = await meetup.save();
    res.status(201).json(newMeetup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. حذف لقاء
router.delete("/:id", protect, async (req, res) => {
  try {
    await Meetup.findByIdAndDelete(req.params.id);
    res.json({ message: "Meetup deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

// 4. الانضمام إلى لقاء
router.put("/:id/join", protect, async (req, res) => {
  try {
    const { user } = req.body;

    if (!user || !user.id || !user.name) {
      return res.status(400).json({ message: "Missing user data" });
    }

    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    const alreadyJoined = meetup.attendees.some((attendee) => {
      if (typeof attendee === "string") return false;
      return attendee.id === user.id;
    });

    if (alreadyJoined) {
      return res.status(400).json({
        message: "You have already joined this meetup!",
      });
    }

    meetup.attendees.push({
      id: user.id,
      name: user.name,
    });

    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({ message: "Error joining meetup" });
  }
});
router.put("/:id/leave", protect, async (req, res) => {
  try {
    const { user } = req.body;

    if (!user || !user.id) {
      return res.status(400).json({ message: "Missing user data" });
    }

    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    meetup.attendees = meetup.attendees.filter((attendee) => {
      if (typeof attendee === "string") return true;
      return attendee.id !== user.id;
    });

    await meetup.save();

    res.json({
      message: "Left meetup successfully",
      meetup,
    });
  } catch (err) {
    res.status(500).json({ message: "Error leaving meetup" });
  }
});

module.exports = router;