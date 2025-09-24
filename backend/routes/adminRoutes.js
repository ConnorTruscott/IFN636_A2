const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const {
  createStaff,
  listStaff,
  // NEW: admin complaint handlers
  getAllComplaints,
  adminGetComplaintById,
  adminUpdateComplaint,
  adminDeleteComplaint,
} = require('../controllers/adminController');

const router = express.Router();

router
  .route('/admin/staff')
  .get(protect, listStaff)
  .post(protect, createStaff);

// Admin complaints
// List all complaints (overview table)
router.get('/admin/complaints', protect, getAllComplaints);

// Get a single complaint (populate editor)
router.get('/admin/complaints/:id', protect, adminGetComplaintById);

// Update a complaint (Save button)
router.put('/admin/complaints/:id', protect, adminUpdateComplaint);

// Delete a complaint with reason (Delete button)
router.delete('/admin/complaints/:id', protect, adminDeleteComplaint);

module.exports = router;
