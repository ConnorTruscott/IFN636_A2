const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const {createStaff, listStaff} = require('../controllers/adminController');
const router = express.Router();

router.route('/admin/staff').get(protect, listStaff).post(protect, createStaff);

module.exports = router;