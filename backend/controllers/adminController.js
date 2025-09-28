const User = require('../models/User');
const { Admin } = require('../models/UserRoles');
const AdminProxy = require('../design_patterns/adminProxy');
const Complaint = require('../models/Complaint');
// const Category = require('../models/Category'); // no longer used as a source of categories
const Department = require('../models/Department'); // <-- use departments as the category source
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

// list all complaints (newest first) — populate student name only
const getAllComplaints = async (_req, res) => {
  try {
    const complaints = await Complaint.find()
      .sort({ date: -1, createdAt: -1 })
      .populate('userId', 'fullname name'); // student name

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin meta for dropdowns
// Categories come from Department names (SSOT).
// Deduplicate, sort A→Z (case-insensitive), keep "Other" last, and ensure "Other" exists.
const getComplaintMeta = async (_req, res) => {
  try {
    const docs = await Department.find().sort({ name: 1 }); // server-side sort cheap & fine

    // Clean names
    const raw = (docs || [])
      .map(d => (d?.name ?? '').toString().trim())
      .filter(Boolean);

    // Unique
    const unique = Array.from(new Set(raw));

    // Make sure "Other" is present at least once
    const ensured = unique.some(n => n.toLowerCase() === 'other')
      ? unique
      : [...unique, 'Other'];

    // Case-insensitive A→Z, with "Other" last
    const withoutOther = ensured
      .filter(n => n.toLowerCase() !== 'other')
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const categories = [...withoutOther, 'Other'];

    // Locations remain preset & not admin-editable
    const locations = PRESET_LOCATIONS;

    res.json({ categories, locations });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// get single complaint by id — include student name (shape consistent)
const adminGetComplaintById = async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id)
      .populate('userId', 'fullname name');

    if (!c) return res.status(404).json({ message: 'Complaint not found' });

    const obj = c.toObject();
    obj.studentName = obj.userId?.fullname || obj.userId?.name || '';
    // assignedStaff not part of schema currently
    obj.assignedStaffName = obj.assignedStaffName || '';
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update complaint (basic fields incl. status)
const adminUpdateComplaint = async (req, res) => {
  try {
    const { title, category, description, status, date } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (title !== undefined) complaint.title = title;
    if (category !== undefined) complaint.category = category;
    if (description !== undefined) complaint.description = description;
    if (status !== undefined) complaint.status = status;
    if (date !== undefined) complaint.date = date;

    // Admin does not change location; assigned staff not in schema

    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// delete complaint (requires reason in body)
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
