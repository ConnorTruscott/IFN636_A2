const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createStaff, listStaff,
  getAllComplaints, adminGetComplaintById, adminUpdateComplaint, adminDeleteComplaint,
  getComplaintMeta,
} = require('../controllers/adminController');
const {
  listCategories, createCategory, updateCategory, deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// Staff management
router.route('/admin/staff')
  .get(protect, listStaff)
  .post(protect, createStaff);

// Complaints (admin)
router.get('/admin/complaints', protect, getAllComplaints);
router.get('/admin/complaints/:id', protect, adminGetComplaintById);
router.put('/admin/complaints/:id', protect, adminUpdateComplaint);
router.delete('/admin/complaints/:id', protect, adminDeleteComplaint);

// Meta (categories from DB + preset locations)
router.get('/admin/complaints/meta', protect, getComplaintMeta);

// Category CRUD (admin manages categories)
router.get('/admin/categories', protect, listCategories);
router.post('/admin/categories', protect, createCategory);
router.put('/admin/categories/:id', protect, updateCategory);
router.delete('/admin/categories/:id', protect, deleteCategory);

module.exports = router;
