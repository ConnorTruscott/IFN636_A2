const ComplaintController = require('../controllers/complaintController')

class ComplaintControllerProxy {
    constructor(controller){
        this.controller = controller;
    }

    async getComplaints(req, res){
        //Who can get what complaints?
        return this.controller.getComplaints(req, res);
    }

    async addComplaints(req, res){
        //Assuming only students can get complaints
        if (req.user.role === 'Student'){
            return this.controller.addComplaints(req, res);
        }
        return res.status(403).json({message: "Only students can file complaints"});
    }

    async updateComplaints(req, res){
        //Assuming only staff and admin can update a complaint - i.e resolved, handing to a staff, etc
        if (req.user.role === 'Admin'||req.user.role === 'Staff'){
            return this.controller.updateComplaints(req, res);
        }
        return res.status(403).json({message: "Unauthorized to update complaints"});
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
        //Need to work out porper logic here
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