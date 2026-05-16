const express = require("express");
const router = express.Router();
const Meetup = require("../models/Meetup");

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
  const meetup = new Meetup(req.body);
  try {
    const newMeetup = await meetup.save();
    res.status(201).json(newMeetup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. حذف لقاء
router.delete("/:id", async (req, res) => {
  try {
    await Meetup.findByIdAndDelete(req.params.id);
    res.json({ message: "Meetup deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
});

// 4. الانضمام إلى لقاء (المسار الجديد)
router.put("/:id/join", async (req, res) => {
  try {
    const { userName } = req.body;
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) return res.status(404).json({ message: "Meetup not found" });

    // منع التكرار: إذا كان الاسم موجوداً مسبقاً لا تضفه
    if (meetup.attendees.includes(userName)) {
      return res.status(400).json({ message: "You have already joined this meetup!" });
    }

    meetup.attendees.push(userName);
    await meetup.save();

    res.json(meetup);
  } catch (err) {
    res.status(500).json({ message: "Error joining meetup" });
  }
});

module.exports = router;