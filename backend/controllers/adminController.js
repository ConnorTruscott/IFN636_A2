const User = require('../models/User');
const { Admin } = require('../models/UserRoles');
// const AdminProxy = require('../design_patterns/adminProxy');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const PRESET_LOCATIONS = require('../config/locations');
const { SortContext, makeStrategy } = require('../design_patterns/sortStrategy');
const notificationService = require('../design_patterns/NotificationService');
const {UserObserver} = require('../design_patterns/NotificationObservers');
const ComplaintWrapper = require('../design_patterns/complaintStatesWrapper');

// const createStaff = async (req, res) => {
//   try {
//     const admin = new Admin(req.user);
//     // const proxy = new AdminProxy(admin);

//     const { name, email, password, phone, campus, department } = req.body;

//     const newStaff = await proxy.createStaff(
//       { name, email, password, phone, campus, role: 'Staff' },
//       department,
//       req.user
//     );

//     const savedStaff = await User.create({ ...newStaff.user, role: 'Staff', department });

//     const NotificationService = require('../design_patterns/NotificationService');
//     NotificationService.userRegistered(savedStaff);

//     res.status(201).json(savedStaff);
//   } catch (error) {
//     res.status(403).json({ message: error.message });
//   }
// };

const createStaff = async (req, res) => {
  try {
    const admin = new Admin(req.user); 
    const { name, email, password, phone, campus, department } = req.body;

    const newStaff = await admin.createStaff(
      { name, email, password, phone, campus, role: 'Staff' },
      department
    );

    const savedStaff = await User.create({ ...newStaff.user, role: 'Staff', department });

    const NotificationService = require('../design_patterns/NotificationService');
    NotificationService.userRegistered(savedStaff);

    res.status(201).json(savedStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

const deleteStaff = async (req, res) => {
  try{
    const {id}=req.params;

    const staff = await User.findOneAndDelete({_id: id, role: 'Staff'});
    if (!staff) {
      return res.status(404).json({message: 'Staff not found'});
    }

    res.json({message: 'Staff deleted successfully'});
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const updateStaffDepartment = async (req, res) => {
  try {
    const {id} = req.params;
    const {department} = req.body;

    const staff = await User.findOneAndUpdate(
      {_id: id, role: 'Staff'},
      {department},
      {new: true}
    );

    if (!staff) {
      return res.status(404).json({message: 'Staff not found'});
    }
    res.json(staff);
  } catch (err) {
    res.status(500).json({message: err.message});
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const sortKey = String(req.query.sort || 'date');
    const dir = String(req.query.dir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    const rows = await Complaint.find()
      .populate('userId', 'fullname name')
      .lean();

    const enriched = await Promise.all(rows.map(async (r) => {
      let assignedStaffName = '';
      if (r.assignedStaff) {
        const staff = await User.findById(r.assignedStaff, 'fullname name').lean();
        if (staff) assignedStaffName = staff.fullname || staff.name || '';
      }
      if (!assignedStaffName && r.category) {
        const staff = await User.findOne({ role: 'Staff', department: r.category }, 'fullname name').lean();
        if (staff) assignedStaffName = staff.fullname || staff.name || '';
      }
      const studentName = r.userId?.fullname || r.userId?.name || '';
      return { ...r, studentName, assignedStaffName };
    }));

    const ctx = new SortContext(makeStrategy(sortKey));
    const sorted = ctx.execute(enriched, dir);

    res.json(sorted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getComplaintMeta = async (_req, res) => {
  try {
    const docs = await Department.find().sort({ name: 1 });

    const raw = (docs || [])
      .map(d => (d?.name ?? '').toString().trim())
      .filter(Boolean);

    const unique = Array.from(new Set(raw));
    const ensured = unique.some(n => n.toLowerCase() === 'other')
      ? unique
      : [...unique, 'Other'];

    const withoutOther = ensured
      .filter(n => n.toLowerCase() !== 'other')
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const categories = [...withoutOther, 'Other'];

    const locations = PRESET_LOCATIONS;
    res.json({ categories, locations });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// get single complaint by id — include studentName & assignedStaffName
const adminGetComplaintById = async (req, res) => {
  try {
    const r = await Complaint.findById(req.params.id)
      .populate('userId', 'fullname name')
      .lean();

    if (!r) return res.status(404).json({ message: 'Complaint not found' });

    let assignedStaffName = '';

    if (r.assignedStaff) {
      const staff = await User.findById(r.assignedStaff, 'fullname name').lean();
      if (staff) assignedStaffName = staff.fullname || staff.name || '';
    }

    if (!assignedStaffName && r.category) {
      const staff = await User.findOne(
        { role: 'Staff', department: r.category },
        'fullname name'
      ).lean();
      if (staff) assignedStaffName = staff.fullname || staff.name || '';
    }

    const studentName = r.userId?.fullname || r.userId?.name || '';
    res.json({ ...r, studentName, assignedStaffName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const adminUpdateComplaint = async (req, res) => {
  try {
    const { title, category, description, status, date } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const changes = {};

    if (title !== undefined) {
      const t = String(title).trim();
      if (!t) return res.status(400).json({ message: 'Title cannot be empty' });
      if (t !== complaint.title) changes.title = t;
    }

    if (category !== undefined) {
      const c = String(category).trim();
      if (c && c !== complaint.category) changes.category = c;
    }

    if (description !== undefined) {
      const d = String(description);
      if (d !== complaint.description) changes.description = d;
    }

    if (date !== undefined && String(date).trim() !== '') {
      const ms = new Date(date).getTime();
      if (!Number.isFinite(ms)) return res.status(400).json({ message: 'Invalid date' });
      const nd = new Date(ms);
      if (!complaint.date || +complaint.date !== +nd) changes.date = nd;
    }

    if (typeof status === 'string' && status.trim()) {
      const next = status.trim();
      if (next !== complaint.status) {
        const wrapper = new ComplaintWrapper(complaint);
        try {
          await wrapper.updateStatus(next);
        } catch (err) {
          return res.status(400).json({ message: err.message || 'Invalid status transition' });
        }
      }
    }

    Object.assign(complaint, changes);
    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
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
  deleteStaff,
  updateStaffDepartment,
  getAllComplaints,
  adminGetComplaintById,
  adminUpdateComplaint,
  adminDeleteComplaint,
  getComplaintMeta,
};
