const Complaint = require('../models/Complaint');
const StaffCategory = require('../models/StaffCategory');

/**
 * @desc    Get all complaints assigned to the logged-in staff member's category.
 * @route   GET /api/staff/complaints
 * @access  Private (Staff only)
 * @details This function first finds which category the staff member is assigned to.
 * Then, it fetches all complaints belonging to that category.
 * Feedback is included automatically because it's embedded in the Complaint model.
 */
const getAssignedComplaints = async (req, res) => {
    try {
        // Step 1: Find the category assigned to the currently logged-in staff user.
        // The user's ID (req.user.id) is added to the request by your authentication middleware.
        const staffAssignment = await StaffCategory.findOne({ userId: req.user.id });

        if (!staffAssignment) {
            // If the staff user hasn't been assigned a category by an admin yet.
            return res.status(403).json({ message: "Access denied: You are not assigned to a staff category." });
        }

        // Step 2: Find all complaints that match the staff member's assigned category.
        const complaints = await Complaint.find({ category: staffAssignment.category })
            .populate('userId', 'name email') // Fetches the name and email of the user who created the complaint.
            .sort({ date: -1 }); // Show the most recent complaints first.

        res.json(complaints);

    } catch (error) {
        console.error("Error fetching assigned complaints:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

/**
 * @desc    Update the status of a specific complaint.
 * @route   PUT /api/staff/complaints/:id
 * @access  Private (Staff only)
 * @details Allows a staff member to change a complaint's status (e.g., to 'resolving' or 'closed').
 * Crucially, it includes a security check to ensure the staff member can only
 * update complaints within their own assigned category.
 */
const updateComplaintStatus = async (req, res) => {
    const { status } = req.body;
    const complaintId = req.params.id;

    // Validate that a valid status was sent in the request body.
    const allowedStatuses = ['received', 'resolving', 'closed'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Please use one of: ${allowedStatuses.join(', ')}` });
    }

    try {
        // Step 1: Find the staff member's assigned category.
        const staffAssignment = await StaffCategory.findOne({ userId: req.user.id });
        if (!staffAssignment) {
            return res.status(403).json({ message: "Access denied: You are not assigned to a staff category." });
        }

        // Step 2: Find the complaint the staff wants to update.
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found." });
        }

        // Step 3: SECURITY CHECK! Ensure the complaint's category matches the staff's category.
        // This prevents a staff member from "IT" from closing a "Maintenance" complaint.
        if (complaint.category !== staffAssignment.category) {
            return res.status(403).json({ message: "Forbidden: You are not authorized to update this complaint." });
        }

        // Step 4: Update the status and the 'completed' field.
        complaint.status = status;
        if (status === 'closed') {
            complaint.completed = true;
        } else {
            complaint.completed = false; // Mark as not completed if status is reverted from 'closed'.
        }

        const updatedComplaint = await complaint.save();
        res.json(updatedComplaint);

    } catch (error) {
        console.error("Error updating complaint status:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
};


module.exports = {
    getAssignedComplaints,
    updateComplaintStatus,
};