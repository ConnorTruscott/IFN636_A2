const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const { getNotifications } = require('../controllers/notificationController');
const { deleteNotification } = require('../controllers/notificationController');
const { markAsRead } = require('../controllers/notificationController');
const router = express.Router();

router.get('/', protect, getNotifications);
router.delete('/:id', protect, deleteNotification);
router.post('/mark-read', protect, markAsRead);

module.exports = router;