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
router.route('/staff')
  .get(protect, listStaff)
  .post(protect, createStaff);

// Meta (categories from DB + preset locations)
router.get('/complaints/meta', protect, getComplaintMeta);

// Complaints (admin)
router.get('/complaints', protect, getAllComplaints);
router.get('/complaints/:id', protect, adminGetComplaintById);
router.put('/complaints/:id', protect, adminUpdateComplaint);
router.delete('/complaints/:id', protect, adminDeleteComplaint);



// Category CRUD (admin manages categories)
router.get('/categories', protect, listCategories);
router.post('/categories', protect, createCategory);
router.put('/categories/:id', protect, updateCategory);
router.delete('/categories/:id', protect, deleteCategory);

module.exports = router;
