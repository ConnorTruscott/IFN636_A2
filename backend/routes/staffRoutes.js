const express = require('express');
const router = express.Router();
const { protect, isStaff } = require('../middleware/authMiddleware');

const complaintController = require('../controllers/complaintController');

console.log('Available functions from complaintController:', complaintController);

const { 
    getComplaintsByCategory, 
    updateComplaintStatusByStaff 
} = complaintController;

router.route('/complaints').get(protect, isStaff, getComplaintsByCategory);

router.route('/complaints/:id').put(protect, isStaff, updateComplaintStatusByStaff);

module.exports = router;