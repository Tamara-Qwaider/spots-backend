const express = require("express");
const router = express.Router();
const Meetup = require("../models/Meetup");
const Notification = require("../models/Notification");

// 1. جلب كل اللقاءات
router.get("/", async (req, res) => {
  try {
    const meetups = await Meetup.find().sort({ createdAt: -1 });
    res.json(meetups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. إنشاء لقاء جديد
router.post("/create", async (req, res) => {
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
      img
    } = req.body;

    const finalAttendees =
      attendees && attendees.length > 0 ? attendees : [createdBy || "Host"];

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
      img
    });

    const newMeetup = await meetup.save();
    res.status(201).json(newMeetup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Optional: إنشاء لقاء من /api/meetups مباشرة
router.post("/", async (req, res) => {
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
      img
    } = req.body;

    const finalAttendees =
      attendees && attendees.length > 0 ? attendees : [createdBy || "Host"];

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
      img
    });

    const newMeetup = await meetup.save();
    res.status(201).json(newMeetup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. تعديل لقاء من الأدمن
router.put("/:id", async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    const oldTitle = meetup.title;

    meetup.title = req.body.title ?? meetup.title;
    meetup.location = req.body.location ?? meetup.location;
    meetup.date = req.body.date ?? meetup.date;
    meetup.time = req.body.time ?? meetup.time;
    meetup.notes = req.body.notes ?? meetup.notes;
    meetup.img = req.body.img ?? meetup.img;

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
          message: `Meetup "${oldTitle}" has been updated by admin.`
        }))
      );
    }

    res.json(updatedMeetup);
  } catch (err) {
    res.status(500).json({ message: "Error updating meetup" });
  }
});

// 4. حذف لقاء
router.delete("/:id", async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    const attendeesToNotify = meetup.attendees || [];

    if (attendeesToNotify.length > 0) {
      await Notification.insertMany(
        attendeesToNotify.map((userName) => ({
          userName,
          meetupId: meetup._id.toString(),
          meetupTitle: meetup.title,
          type: "delete",
          message: `Meetup "${meetup.title}" has been deleted by admin.`
        }))
      );
    }

    await Meetup.findByIdAndDelete(req.params.id);

    res.json({ message: "Meetup deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

// 5. الانضمام إلى لقاء / قبول الدعوة
router.put("/:id/join", async (req, res) => {
  try {
    const { userName } = req.body;
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    const maxLimit = meetup.maxParticipants || 10;

    if (meetup.attendees.length >= maxLimit) {
      return res.status(400).json({ message: "Sorry, this meetup is full!" });
    }

    if (meetup.attendees.includes(userName)) {
      return res.status(400).json({
        message: "You have already joined this meetup!"
      });
    }

    meetup.attendees.push(userName);

    meetup.invitedPeople = meetup.invitedPeople.filter(
      (person) => person !== userName
    );

    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({ message: "Error joining meetup" });
  }
});

// 6. مغادرة اللقاء
router.put("/:id/leave", async (req, res) => {
  try {
    const { userName } = req.body;
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    meetup.attendees = meetup.attendees.filter(
      (person) => person !== userName
    );

    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({ message: "Error leaving meetup" });
  }
});

// 7. تجاهل الدعوة
router.put("/:id/deny", async (req, res) => {
  try {
    const { userName } = req.body;
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({ message: "Meetup not found" });
    }

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    meetup.invitedPeople = meetup.invitedPeople.filter(
      (person) => person !== userName
    );

    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({ message: "Error denying invite" });
  }
});

module.exports = router;