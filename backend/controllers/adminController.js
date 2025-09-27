const User = require('../models/User');
const {Admin} = require('../models/UserRoles');
const AdminProxy = require('../design_patterns/adminProxy');
const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const PRESET_LOCATIONS = require('../config/locations');
const { SortContext, makeStrategy } = require('../design_patterns/sortStrategy'); //new

const createStaff = async (req, res) => {
    try{
        const admin = new Admin(req.user);
        const proxy = new AdminProxy(admin);

        const {name, email, password, phone, campus, department} = req.body;

        const newStaff = await proxy.createStaff(
            {name, email, password, phone, campus, role: 'Staff'},
            department,
            req.user
        );

        const savedStaff = await User.create({...newStaff.user, role: 'Staff', department});

        const NotificationService = require('../design_patterns/NotificationService');
        NotificationService.userRegistered(savedStaff);

        res.status(201).json(savedStaff);
    } catch (error){
        res.status(403).json({message: error.message});
    }
};

const listStaff = async (req, res) => {
    try{
        const staffList = await User.find({role:'Staff'});
        res.json(staffList);
    } catch (error){
        res.status(500).json({message: error.message});
    }
};

// list all complaints (newest first)
// const getAllComplaints = async (_req, res) => {
//   try {
//     const complaints = await Complaint.find().sort({ date: -1, createdAt: -1 });
//     res.json(complaints);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getAllComplaints = async (req, res) => {
  try {
    const sortKey = req.query.sort || 'date';
    const ctx = new SortContext(makeStrategy(sortKey));
    const complaints = await Complaint.find().sort(ctx.spec());
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin meta for dropdowns
const getComplaintMeta = async (_req, res) => {
  try {
    const docs = await Category.find().sort({ name: 1 });
    const categories = docs.map(c => c.name);
    const locations = PRESET_LOCATIONS; // admin cannot edit these
    res.json({ categories, locations });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// get single complaint by id
const adminGetComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update complaint (basic fields incl. status/photos)
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