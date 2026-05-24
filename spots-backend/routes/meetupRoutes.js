const express = require("express");
const router = express.Router();

const Meetup = require("../models/Meetup");
const Notification = require("../models/Notification");
const protect = require("../middleware/authMiddleware");

// 1. جلب اللقاءات النشطة فقط بدون حذف القديم من MongoDB
router.get("/", async (req, res) => {
  try {
    const now = new Date();

    const meetups = await Meetup.find({
      status: { $ne: "cancelled" },
      $or: [
        { expiresAt: { $gt: now } },
        { expiresAt: { $exists: false } },
        { expiresAt: null }
      ]
    }).sort({ createdAt: -1 });

    res.json(meetups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. إنشاء لقاء جديد
router.post("/create", protect, async (req, res) => {
  try {
    const {
      title,
      location,
      date,
      time,
      invitedPeople,
      notes,
      maxParticipants,
      createdBy,
      attendees,
      img,
    } = req.body;

    const meetupDateTime = new Date(`${date}T${time}`);

    if (isNaN(meetupDateTime.getTime())) {
      return res.status(400).json({
        message: "Invalid meetup date or time",
      });
    }

    if (meetupDateTime <= new Date()) {
      return res.status(400).json({
        message: "You cannot create a meetup in the past",
      });
    }

    const finalAttendees =
      attendees && attendees.length > 0
        ? attendees
        : [createdBy || "Host"];

    const meetup = new Meetup({
      title,
      location,
      date,
      time,
      invitedPeople: invitedPeople || [],
      notes,
      maxParticipants: Number(maxParticipants) || 10,
      createdBy: createdBy || "Guest",
      attendees: finalAttendees,
      img,
      expiresAt: meetupDateTime,
      status: "active",
    });

    const newMeetup = await meetup.save();

    res.status(201).json(newMeetup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. تعديل لقاء
router.put("/:id", protect, async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        message: "Meetup not found",
      });
    }

    const oldTitle = meetup.title;

    meetup.title = req.body.title ?? meetup.title;
    meetup.location = req.body.location ?? meetup.location;
    meetup.date = req.body.date ?? meetup.date;
    meetup.time = req.body.time ?? meetup.time;
    meetup.notes = req.body.notes ?? meetup.notes;
    meetup.img = req.body.img ?? meetup.img;

    const updatedDateTime = new Date(`${meetup.date}T${meetup.time}`);

    if (isNaN(updatedDateTime.getTime())) {
      return res.status(400).json({
        message: "Invalid meetup date or time",
      });
    }

    meetup.expiresAt = updatedDateTime;
    meetup.status = updatedDateTime > new Date() ? "active" : "expired";

    if (req.body.maxParticipants !== undefined) {
      meetup.maxParticipants =
        Number(req.body.maxParticipants) || meetup.maxParticipants;
    }

    if (Array.isArray(req.body.attendees)) {
      meetup.attendees = req.body.attendees;
    }

    if (Array.isArray(req.body.invitedPeople)) {
      meetup.invitedPeople = req.body.invitedPeople;
    }

    const updatedMeetup = await meetup.save();

    const attendeesToNotify = updatedMeetup.attendees || [];

    if (attendeesToNotify.length > 0) {
      await Notification.insertMany(
        attendeesToNotify.map((userName) => ({
          userName,
          meetupId: updatedMeetup._id.toString(),
          meetupTitle: updatedMeetup.title,
          type: "edit",
          message: `Meetup "${oldTitle}" has been updated by admin.`,
        }))
      );
    }

    res.json(updatedMeetup);
  } catch (err) {
    res.status(500).json({
      message: "Error updating meetup",
    });
  }
});

// 4. إلغاء لقاء
router.delete("/:id", protect, async (req, res) => {
  try {
    console.log("Deleting meetup id:", req.params.id);

    const deletedMeetup = await Meetup.findByIdAndDelete(req.params.id);

    if (!deletedMeetup) {
      return res.status(404).json({
        message: "Meetup not found",
      });
    }
    
    res.json({
      message: "Meetup deleted successfully",
    });
  } catch (err) {
    console.error("DELETE MEETUP ERROR:", err.message);

    res.status(500).json({
      message: "Server error while deleting meetup",
      error: err.message,
    });
  }
});

// 5. الانضمام إلى لقاء
router.put("/:id/join", protect, async (req, res) => {
  try {
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({
        message: "userName is required",
      });
    }

    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        message: "Meetup not found",
      });
    }

    if (meetup.status === "cancelled") {
      return res.status(400).json({
        message: "This meetup has been cancelled",
      });
    }

    if (meetup.expiresAt && new Date(meetup.expiresAt) < new Date()) {
      meetup.status = "expired";
      await meetup.save();

      return res.status(400).json({
        message: "This meetup has already ended",
      });
    }

    const maxLimit = meetup.maxParticipants || 10;

    if (meetup.attendees.length >= maxLimit) {
      return res.status(400).json({
        message: "Sorry, this meetup is full!",
      });
    }

    if (meetup.attendees.includes(userName)) {
      return res.status(400).json({
        message: "You have already joined this meetup!",
      });
    }

    meetup.attendees.push(userName);

    meetup.invitedPeople = meetup.invitedPeople.filter(
      (person) => person !== userName
    );

    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({
      message: "Error joining meetup",
    });
  }
});

// 6. مغادرة اللقاء
router.put("/:id/leave", protect, async (req, res) => {
  try {
    const { userName } = req.body;

    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        message: "Meetup not found",
      });
    }

    if (!userName) {
      return res.status(400).json({
        message: "userName is required",
      });
    }

    meetup.attendees = meetup.attendees.filter(
      (person) => person !== userName
    );

    await meetup.save();

    res.json({
      message: "Left meetup successfully",
      meetup,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error leaving meetup",
    });
  }
});

// 7. تجاهل الدعوة
router.put("/:id/deny", protect, async (req, res) => {
  try {
    const { userName } = req.body;

    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        message: "Meetup not found",
      });
    }

    if (!userName) {
      return res.status(400).json({
        message: "userName is required",
      });
    }

    meetup.invitedPeople = meetup.invitedPeople.filter(
      (person) => person !== userName
    );

    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({
      message: "Error denying invite",
    });
  }
});

module.exports = router;