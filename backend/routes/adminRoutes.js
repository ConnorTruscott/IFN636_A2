const express = require('express');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  createStaff, listStaff, deleteStaff, updateStaffDepartment,
  getAllComplaints, adminGetComplaintById, adminUpdateComplaint, adminDeleteComplaint,
  getComplaintMeta,
} = require('../controllers/adminController');
const {
  listCategories, createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Staff management
router.route('/staff')
  .get(protect, isAdmin, listStaff)
  .post(protect, isAdmin, createStaff);

router.delete('/staff/:id',protect, isAdmin, deleteStaff);
router.put('/staff/:id/department', protect, isAdmin, updateStaffDepartment);

// Meta (categories from DB + preset locations)
router.get('/complaints/meta', protect, isAdmin, getComplaintMeta);

// Complaints (admin)
router.get('/complaints', protect, isAdmin, getAllComplaints);
router.get('/complaints/:id', protect, isAdmin, adminGetComplaintById);
router.put('/complaints/:id', protect, isAdmin, adminUpdateComplaint);
router.delete('/complaints/:id', protect, isAdmin, adminDeleteComplaint);



// Category CRUD (admin manages categories)
router.get('/categories', protect, isAdmin, listCategories);
router.post('/categories', protect, isAdmin, createCategory);
router.put('/categories/:id', protect, isAdmin, updateCategory);
router.delete('/categories/:id', protect, isAdmin, deleteCategory);

module.exports = router;
