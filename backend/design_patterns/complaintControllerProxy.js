const ComplaintController = require('../controllers/complaintController');

class ComplaintControllerProxy {
    constructor(controller){
        this.controller = controller;

    }

    async getComplaints(req, res){
        if (req.user.role === 'Admin'){
            return this.controller.getAllComplaints(req, res);
        }if (req.user.role === 'Staff'){
            return this.controller.getComplaintsByCategory(req, res);
        } else{
            return this.controller.getComplaints(req, res);
        }
        
    }

    async addComplaint(req, res){
        if (req.user.role === 'Student'){
            return this.controller.addComplaint(req, res);
        }
        return res.status(403).json({message: "Only students can file complaints"});
    }

    async updateComplaint(req, res){
        if (req.user.role === 'Admin'||req.user.role === 'Staff'){
            return this.controller.updateComplaint(req, res);
        }
    if (req.user.role === 'Student') {
            const Complaint = require('../models/Complaint');
            try {
                const complaint = await Complaint.findById(req.params.id);
                if (!complaint) {
                    return res.status(404).json({ message: "Complaint not found" });
                }
                if (complaint.userId.toString() !== req.user.id) {
                    return res.status(403).json({ message: "You can only update your own complaints" });
                }
                return this.controller.updateComplaint(req, res);
            } catch (err) {
                return res.status(500).json({ message: err.message });
            }
        }
        
        return res.status(403).json({ message: "Unauthorized to update complaints" });
    }
        

    async deleteComplaint(req, res){
        //Only Admin can delete complaints
        if (req.user.role ==='Admin'){
            return this.controller.deleteComplaint(req, res);
        }
        return res.status(403).json({message: "Only Admins can delete complaints"});
    }

    async getClosedComplaints(req, res){
        //Staff and Admin can see all closed complaints, students only see their own
        if (req.user.role === 'Admin'||req.user.role === 'Staff'){
            return this.controller.getClosedComplaints(req, res);
        } else {
            return this.controller.getClosedComplaints(req, res);
        }
    }

    async saveFeedback(req, res){
        if (req.user.role === 'Student'){
            return this.controller.saveFeedback(req, res);
        }
        return res.status(403).json({message: "Only students can leave feedback"});
    }

    async deleteFeedback(req, res){
        //Only Admin can delete feedback
        if (req.user.role === 'Admin'){
            return this.controller.deleteFeedback(req, res);
        }
        return res.status(403).json({message: "Only Admins can delete feedback"})
    }

}

module.exports = new ComplaintControllerProxy(ComplaintController);