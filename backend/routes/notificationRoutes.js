const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.id});
        res.json(notifications);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;