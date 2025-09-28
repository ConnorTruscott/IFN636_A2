const User = require('../models/User');
const { Admin } = require('../models/UserRoles');
const AdminProxy = require('../design_patterns/adminProxy');
const Complaint = require('../models/Complaint');
// We now treat Department as the single source of truth for categories
const Department = require('../models/Department');
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

/**
 * List all complaints (newest first) and include:
 *  - studentName (from populated user)
 *  - assignedStaffName (derived: first staff found in the complaint's department = category)
 */
const getAllComplaints = async (_req, res) => {
  try {
    // 1) complaints + student
    const rows = await Complaint.find()
      .sort({ date: -1, createdAt: -1 })
      .populate('userId', 'fullname name')
      .lean();

    // 2) unique departments from complaint.category
    const deptSet = new Set(rows.map(r => (r.category || '').trim()).filter(Boolean));
    const depts = Array.from(deptSet);

    // 3) fetch staff for those departments (one query)
    const staff = await User.find(
      { role: 'Staff', department: { $in: depts } },
      { name: 1, fullname: 1, department: 1 }
    ).lean();

    // department -> a display name (take the first we find)
    const staffByDept = {};
    for (const s of staff) {
      const display = s.fullname || s.name || '';
      if (!staffByDept[s.department] && display) {
        staffByDept[s.department] = display;
      }
    }

    // 4) shape response
    const complaints = rows.map(r => ({
      ...r,
      studentName: r.userId?.fullname || r.userId?.name || '',
      assignedStaffName: staffByDept[r.category] || ''
    }));

    res.json(complaints);
  } catch (error) {
    console.error('getAllComplaints failed:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin meta for dropdowns
 * Categories come from Department names (SSOT).
 * Deduplicate, sort A→Z (case-insensitive), keep "Other" last, and ensure "Other" exists.
 */
const getComplaintMeta = async (_req, res) => {
  try {
    const docs = await Department.find().sort({ name: 1 });

    // Clean names
    const raw = (docs || [])
      .map(d => (d?.name ?? '').toString().trim())
      .filter(Boolean);

    // Unique
    const unique = Array.from(new Set(raw));

    // Ensure "Other"
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

/**
 * Get single complaint by id — include derived names for consistency with the list view.
 */
const adminGetComplaintById = async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id)
      .populate('userId', 'fullname name')
      .lean();

    if (!c) return res.status(404).json({ message: 'Complaint not found' });

    // derive assigned staff from department == category
    let assignedStaffName = '';
    if (c.category) {
      const s = await User.findOne(
        { role: 'Staff', department: c.category },
        { name: 1, fullname: 1 }
      ).lean();
      assignedStaffName = s?.fullname || s?.name || '';
    }

    res.json({
      ...c,
      studentName: c.userId?.fullname || c.userId?.name || '',
      assignedStaffName
    });
  } catch (error) {
    console.error('adminGetComplaintById failed:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update complaint (basic fields incl. status)
 * Admin does not change location; assigned staff is derived, not stored in Complaint.
 */
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

    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
