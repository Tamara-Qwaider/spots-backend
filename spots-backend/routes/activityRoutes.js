const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// 1. Get all activities
router.get('/', async (req, res) => {
    try {
        const activities = await Activity.find();
        res.json(activities);
    } catch (err) {
        console.error("Error fetching activities:", err.message);
        res.status(500).json({ message: err.message });
    }
});

// 2. Create a new activity (Accept Invite)
router.post('/', async (req, res) => {
    const activity = new Activity({
        title: req.body.title,
        location: req.body.location,
        description: req.body.description,
        date: req.body.date,
        time: req.body.time,
        participantsCount: req.body.participantsCount,
        icon: req.body.icon,
        hostName: req.body.hostName
    });

    try {
        const newActivity = await activity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        console.error("Error saving activity:", err.message);
        res.status(400).json({ message: err.message });
    }
});

// 3. Delete an activity (Leave Activity)
router.delete('/:id', async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: "Activity not found" });
        }
        res.json({ message: "Activity removed successfully" });
    } catch (err) {
        console.error("Error deleting activity:", err.message);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;