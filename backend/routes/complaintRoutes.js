const express = require('express');
const { getComplaints, addComplaint, updateComplaint, deleteComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const upload = require('../utils/upload');             
const Complaint = require('../models/Complaint');

router.route('/').get(protect, getComplaints).post(protect, addComplaint);
router.route('/:id').put(protect, updateComplaint).delete(protect, deleteComplaint);

// photo upload 
router.post('/:id/photos', protect, upload.array('photos', 5), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const newFiles = (req.files || []).map(f => f.filename);

    // max 5 
    const current = complaint.photos || [];
    if (current.length + newFiles.length > 5) {
      return res.status(400).json({ message: 'Max 5 photos per complaint' });
    }

    complaint.photos = [...current, ...newFiles];
    const updated = await complaint.save();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// remove photo 
router.delete('/:id/photos/:filename', protect, async (req, res) => {
  try {
    const { id, filename } = req.params;
    const complaint = await Complaint.findOne({ _id: id, userId: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.photos = (complaint.photos || []).filter(p => p !== filename);
    const updated = await complaint.save();

    // Optional: also remove file from disk
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;