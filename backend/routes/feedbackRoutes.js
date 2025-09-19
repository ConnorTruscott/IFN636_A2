const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getClosedComplaints,
  saveFeedback,
  deleteFeedback,
} = require('../controllers/complaintController');

router.get('/', protect, getClosedComplaints);
router.put('/:id', protect, saveFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
