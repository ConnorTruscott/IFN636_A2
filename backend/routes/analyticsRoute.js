const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

// Only Admin can view Analytics
router.get('/', protect, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Only Admin can access analytics' });
  }
  return getAnalytics(req, res);
});

module.exports = router;