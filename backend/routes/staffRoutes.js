// routes/staffRoutes.js

const express = require('express');
const router = express.Router();
const { protect, isStaff } = require('../middleware/authMiddleware');

// Step 1: Import the ENTIRE controller object first
const complaintController = require('../controllers/complaintController');

// Step 2: DEBUGGING - Log the entire object to see what's inside
console.log('Available functions from complaintController:', complaintController);

// Step 3: Destructure the functions you need from the object
const { 
    getComplaintsByCategory, 
    updateComplaintStatusByStaff 
} = complaintController;

// GET complaints for the staff member's category/department
router.route('/complaints').get(protect, isStaff, getComplaintsByCategory);

// UPDATE a specific complaint's status
router.route('/complaints/:id').put(protect, isStaff, updateComplaintStatusByStaff);

module.exports = router;