// backend/controllers/adminController.js
const User = require('../models/User');
const { Admin } = require('../models/UserRoles');
const AdminProxy = require('../design_patterns/adminProxy');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const PRESET_LOCATIONS = require('../config/locations');

const createStaff = async (req, res) => {
  try {
    const admin = new Admin(req.user);
    const proxy = new AdminProxy(admin);

    const { name, email, password, phone, campus, department } = req.body;

    const newStaff = await proxy.createStaff(
      { name, email, password, phone, campus, role: 'Staff' },
      department,
      req.user
    );

    const savedStaff = await User.create({ ...newStaff.user, role: 'Staff', department });

    const NotificationService = require('../design_patterns/NotificationService');
    NotificationService.userRegistered(savedStaff);

    res.status(201).json(savedStaff);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

const listStaff = async (_req, res) => {
  try {
    const staffList = await User.find({ role: 'Staff' });
    res.json(staffList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List all complaints (newest first), include student name only
const getAllComplaints = async (_req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ date: -1, createdAt: -1 })
      .populate('userId', 'fullname name')
      .lean();

    // expose a flat studentName field for the frontend
    const mapped = complaints.map((r) => ({
      ...r,
      studentName: r.userId?.fullname || r.userId?.name || '',
    }));

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin meta for dropdowns
const getComplaintMeta = async (_req, res) => {
  try {
    const docs = await Category.find().sort({ name: 1 });
    const categories = docs.map((c) => c.name);
    const locations = PRESET_LOCATIONS; // admin cannot edit these
    res.json({ categories, locations });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get single complaint by id (with student name only)
const adminGetComplaintById = async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id)
      .populate('userId', 'fullname name');

    if (!c) return res.status(404).json({ message: 'Complaint not found' });

    const obj = c.toObject();
    obj.studentName = obj.userId?.fullname || obj.userId?.name || '';
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update complaint (no staff reassignment in rollback)
const adminUpdateComplaint = async (req, res) => {
  try {
    const { title, category, description, status, photos, date } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (title !== undefined) complaint.title = title;
    if (category !== undefined) complaint.category = category;
    if (description !== undefined) complaint.description = description;
    if (status !== undefined) complaint.status = status;
    if (Array.isArray(photos)) complaint.photos = photos;
    if (date !== undefined) complaint.date = date;

    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete complaint (requires reason)
const adminDeleteComplaint = async (req, res) => {
  try {
    const { reason } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: 'Delete reason is required' });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted', reason });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStaff,
  listStaff,
  getAllComplaints,
  adminGetComplaintById,
  adminUpdateComplaint,
  adminDeleteComplaint,
  getComplaintMeta,
};
