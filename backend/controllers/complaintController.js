const Complaint = require('../models/Complaint');
const { StudentFilterStrategy } = require('../design_patterns/StudentFilterStrategy');
const { AdminSortByDateStrategy, AdminSortByStatusStrategy, AdminSortByCategoryStrategy} = require('../design_patterns/AdminFilterStrategy');
const notificationService = require('../design_patterns/NotificationService');
const { compare } = require('bcrypt');

// READ
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//For Admin usage
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ date: -1});
    res.json(complaints);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// For staff to view complaints by catergry
const getComplaintsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const complaints = await Complaint.find({ category: category });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Student: Complaint Filter by date 
//const getComplaintsSortedByDate = async (req, res, order) => {
  //try {
    //const strategy = new StudentFilterStrategy();
    //const complaints = await strategy.applyFilter(req, Complaint, order);
    //res.json(complaints);
  //} catch (error) {
    //console.error("Error in getComplaintsSortedByDate:", error);
    //res.status(500).json({ message: "Error sorting complaints" });
  //}
//};

// Admin: Complaint Filter by date, status, category
//const getComplaintsSortedByAdmin = async (req, res, type, order) => {
  //try {
    //let strategy;

    //switch (type) {
      //case "date":
        //strategy = new AdminSortByDateStrategy();
        //break;
      //case "status":
        //strategy = new AdminSortByStatusStrategy();
        //break;
      //case "category":
        //strategy = new AdminSortByCategoryStrategy();
        //break;
      //default:
        //return res.status(400).json({ message: "Invalid sort type" });
    //}

    //const complaints = await strategy.applyFilter(req, Complaint, order);
    //res.json(complaints);
  //} catch (error) {
    //res.status(500).json({ message: "Error sorting complaints" });
  //}
//};

// Staff can add below:
// Using 'getComplaintsSortedByStaff'

// CREATE
const addComplaint = async (req, res) => {
  const { title, category, description, location, date } = req.body;
  try {
    const complaint = await Complaint.create({
      userId: req.user.id,
      title,
      category,
      description,
      location,
      date: date ? new Date(date) : null,
      // status defaults in schema
    });
    notificationService.complaintCreated(req.user.id, req.user.name, complaint._id)
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
const updateComplaint = async (req, res) => {
  const { title, category, description, location, completed, date } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.title = title ?? complaint.title;
    complaint.category = category ?? complaint.category;
    complaint.description = description ?? complaint.description;
    complaint.location = location ?? complaint.location;
    if (typeof completed === 'boolean') complaint.completed = completed;
    complaint.date = date ? new Date(date) : complaint.date;

    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    await complaint.remove();
    res.json({ message: 'Complaint deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CLOSED LIST
const getClosedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      userId: req.user.id,
      status: 'closed',
    }).sort({ date: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SAVE/UPDATE FEEDBACK
const saveFeedback = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.feedback = complaint.feedback || {};

    if (text !== undefined) {
      complaint.feedback.text = String(text);
    }

    if (rating !== undefined) {
      const num = Number(rating);
      if (!Number.isInteger(num) || num < 1 || num > 5) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
      }
      complaint.feedback.rating = num;
    }

    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE FEEDBACK
const deleteFeedback = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, userId: req.user.id });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.feedback = undefined;
    const updated = await complaint.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComplaints,
  getAllComplaints,
  getComplaintsByCategory,
  addComplaint,
  updateComplaint,
  deleteComplaint,
  getClosedComplaints,
  saveFeedback,
  deleteFeedback,
  //getComplaintsSortedByDate,
  //getComplaintsSortedByAdmin,
  //getComplaintsSortedByStaff
};
