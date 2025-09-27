const Complaint = require('../models/Complaint');
const notificationService = require('../design_patterns/NotificationService');
const { compare } = require('bcrypt');
const User = require('../models/User');


// READ
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user.id });
    res.json(complaints);
    console.log('hi');
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
  console.log("Attempting to get complaints for staff member's department.");
  try {
      const staffDepartment = req.user.department;

      if (!staffDepartment) {
          // If the staff user has not been assigned a department by an admin.
          return res.status(403).json({ message: "Access denied: You are not assigned to a department." });
      }
      console.log(`Fetching complaints for department: ${staffDepartment}`);
      const complaints = await Complaint.find({ category: staffDepartment })
          .populate('userId', 'name email') // Fetches the name and email of the user who created the complaint.
          .sort({ date: -1 });

      res.json(complaints);

  } catch (error) {
      console.error("Error fetching assigned complaints:", error.message);
      res.status(500).json({ message: "Server Error" });
  }
};

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
      statusTimestamps: { received: new Date() }
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

// Update complaint status for admin
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Record times
    if (status === "received") {
      complaint.statusTimestamps.received = new Date();
    }
    if (status === "resolving") {
      complaint.statusTimestamps.resolving = new Date();
    }
    if (status === "closed") {
      complaint.statusTimestamps.closed = new Date();
    }

    complaint.status = status;
    const updated = await complaint.save();
    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update complaints by staff
const updateComplaintStatusByStaff = async (req, res) => {
    const { status } = req.body;
    const complaintId = req.params.id;

    // Validate the incoming status
    const allowedStatuses = ['received', 'resolving', 'closed'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Please use one of: ${allowedStatuses.join(', ')}` });
    }

    try {
        const staffDepartment = req.user.department;
        if (!staffDepartment) {
            return res.status(403).json({ message: "Access denied: You are not assigned to a department." });
        }

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found." });
        }

        // SECURITY CHECK: Ensures staff can only modify complaints in their own department.
        if (complaint.category !== staffDepartment) {
            return res.status(403).json({ message: "Forbidden: You can only update complaints within your own department." });
        }

        // Update the status and completion fields
        complaint.status = status;
        complaint.completed = (status === 'closed'); // A shorter way to write the if/else

        const updatedComplaint = await complaint.save();
        res.json(updatedComplaint);

    } catch (error) {
        console.error("Error updating complaint status:", error.message);
        res.status(500).json({ message: "Server Error" });
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


// GET FEEDBACKS (Student / Staff / Admin)
const getFeedbacks = async (req, res) => {
  try {
    if (req.user.role.toLowerCase() === 'student') {
      // Student can only view their feedback 
      const complaints = await Complaint.find({
        userId: req.user.id,
        "feedback.text": { $exists: true }
      });

      return res.json(
        complaints.map(c => ({
          _id: c._id,
          complaintTitle: c.title,
          text: c.feedback?.text,
          rating: c.feedback?.rating
        }))
      );
    }

    if (req.user.role.toLowerCase() === 'staff') {
      console.log("DEBUG STAFF:", req.user); 
      // Staff con only view the fedback related to their department
      const complaints = await Complaint.find({
        category: req.user.department,   
        "feedback.text": { $exists: true }
      }).populate('userId', 'name email'); 

      return res.json(
        complaints.map(c => ({
          _id: c._id,
          complaintTitle: c.title,
          studentName: c.userId?.name,
          text: c.feedback?.text,
          rating: c.feedback?.rating
        }))
      );
    }

    if (req.user.role.toLowerCase() === 'admin') {
      // Admin can view all feedback
      const complaints = await Complaint.find({
        "feedback.text": { $exists: true }
      });

      return res.json(
        complaints.map(c => ({
          _id: c._id,
          complaintTitle: c.title,
          text: c.feedback?.text,
          rating: c.feedback?.rating
        }))
      );
    }

    return res.status(403).json({ message: "Unauthorized" });

  } catch (error) {
    console.error("Error fetching feedbacks:", error);
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
      complaint.feedback.text = String(text).trim();;
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
  updateComplaintStatus,
  updateComplaintStatusByStaff,
  deleteComplaint,
  getClosedComplaints,
  saveFeedback,
  deleteFeedback,
  getFeedbacks
};
