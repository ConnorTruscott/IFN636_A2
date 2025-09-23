const express = require('express');
const router = express.Router();
// Import the entire controller object to match the calling convention in your example
const staffController = require('../controllers/staffController');
const { protect, isStaff } = require('../middleware/authMiddleware'); // Middleware to protect routes and check for staff role

// GET all complaints assigned to the staff member.
// This follows the pattern of wrapping the controller call in an anonymous function.
router.route('/complaints').get(protect, isStaff, (req, res) => staffController.getAssignedComplaints(req, res));

// UPDATE a specific complaint's status.
router.route('/complaints/:id').put(protect, isStaff, (req, res) => staffController.updateComplaintStatus(req, res));

module.exports = router;