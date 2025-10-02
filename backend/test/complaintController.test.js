const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import Models and dependencies to be mocked
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const notificationService = require('../design_patterns/NotificationService');
const ComplaintWrapper = require('../design_patterns/complaintStatesWrapper');

// Import the controller functions to be tested
const {
  getComplaints,
  getAllComplaints,
  addComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintsByCategory,
  updateComplaintStatusByStaff,
  saveFeedback,
  getFeedbacks,
} = require('../controllers/complaintController');


describe('Complaint Controller', () => {
  let res;
  let req;

  beforeEach(() => {

    req = {
      user: { id: new mongoose.Types.ObjectId(), department: 'IT', role: 'Student' },
      params: { id: new mongoose.Types.ObjectId() },
      body: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    sinon.stub(notificationService);
  });

  afterEach(() => {
    sinon.restore(); 
  });

  describe('getComplaints (Student view)', () => {
    it('should return complaints for the logged-in user', async () => {
      const mockComplaints = [{ title: 'Complaint 1' }, { title: 'Complaint 2' }];
      sinon.stub(Complaint, 'find').withArgs({ userId: req.user.id }).resolves(mockComplaints);

      await getComplaints(req, res);

      expect(res.json.calledWith(mockComplaints)).to.be.true;
    });
  });

  describe('getAllComplaints (Admin view)', () => {
    it('should return all complaints for an admin', async () => {
        const mockComplaints = [{ title: 'Complaint A' }, { title: 'Complaint B' }];
        const sortStub = sinon.stub().resolves(mockComplaints);
        sinon.stub(Complaint, 'find').returns({ sort: sortStub });

        await getAllComplaints(req, res);

        expect(res.json.calledWith(mockComplaints)).to.be.true;
    });
  });

  describe('addComplaint', () => {
    it('should create a new complaint and return 201', async () => {
      req.body = { title: 'New Issue', category: 'IT' };
      const mockComplaint = { _id: new mongoose.Types.ObjectId(), ...req.body };
      
      sinon.stub(Complaint, 'create').resolves(mockComplaint);
      sinon.stub(User, 'find').resolves([]);

      await addComplaint(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockComplaint)).to.be.true;
    });
  });

  describe('updateComplaint (Student role)', () => {
    it('should allow a student to update their own complaint successfully', async () => {
      const mockComplaint = {
        userId: req.user.id, // The complaint belongs to the user
        title: 'Old Title',
        save: sinon.stub().resolvesThis(),
      };
      req.body.title = 'New Title';
      sinon.stub(Complaint, 'findById').resolves(mockComplaint);

      await updateComplaint(req, res);

      expect(mockComplaint.title).to.equal('New Title');
      expect(mockComplaint.save.calledOnce).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if complaint to update is not found', async () => {
      sinon.stub(Complaint, 'findById').resolves(null);
      await updateComplaint(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  describe('deleteComplaint', () => {
    it('should delete a complaint successfully', async () => {
      const mockComplaint = { remove: sinon.stub().resolves() };
      sinon.stub(Complaint, 'findById').resolves(mockComplaint);
      await deleteComplaint(req, res);
      expect(mockComplaint.remove.calledOnce).to.be.true;
    });
  });

  describe('getComplaintsByCategory (Staff view)', () => {
    it('should return complaints matching the staff members department', async () => {
      req.user.role = 'Staff';
      const mockComplaints = [{ category: 'IT' }];
      const query = { populate: sinon.stub().returnsThis(), sort: sinon.stub().resolves(mockComplaints) };
      sinon.stub(Complaint, 'find').withArgs({ category: 'IT' }).returns(query);

      await getComplaintsByCategory(req, res);

      expect(res.json.calledWith(mockComplaints)).to.be.true;
    });
  });

  describe('updateComplaintStatusByStaff', () => {
    it('should allow staff to update a complaint in their department', async () => {
      req.user.role = 'Staff';
      req.body.status = 'resolving';
      const mockComplaint = { 
        category: 'IT',
        statusTimestamps: {},
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(Complaint, 'findById').resolves(mockComplaint);
      sinon.stub(ComplaintWrapper.prototype, 'updateStatus').resolves();

      await updateComplaintStatusByStaff(req, res);
      
      expect(res.json.calledOnce).to.be.true;
    });
  });

  describe('getFeedbacks', () => {
    it('should return feedback for the logged-in student', async () => {
        req.user.role = 'Student';
        const mockComplaints = [{ _id: 'c1', title: 'T1', feedback: { rating: 5, text: 'Good' } }];
        sinon.stub(Complaint, 'find').resolves(mockComplaints);

        await getFeedbacks(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0][0]).to.have.property('feedback');
    });

    it('should return all feedback for an admin', async () => {
        req.user.role = 'Admin';
        const mockComplaints = [{ _id: 'c1', title: 'T1', feedback: { rating: 5, text: 'Good' } }];
        sinon.stub(Complaint, 'find').resolves(mockComplaints);

        await getFeedbacks(req, res);

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0][0]).to.have.property('complaintTitle');
    });

    it('should return feedback for a staff members department', async () => {
        req.user.role = 'Staff';
        req.user.department = 'IT';
        const mockComplaints = [{ _id: 'c1', title: 'T1', category: 'IT', feedback: { text: 'Helpful' } }];
        const query = { populate: sinon.stub().resolves(mockComplaints) };
        sinon.stub(Complaint, 'find').returns(query);
        
        await getFeedbacks(req, res);

        expect(Complaint.find.calledWith({ category: 'IT', "feedback.text": { $exists: true } })).to.be.true;
        expect(res.json.calledOnce).to.be.true;
    });
  });

  describe('saveFeedback (Student role)', () => {
    it('should allow a student to update feedback for their own complaint', async () => {
        req.body = { text: 'Great service', rating: 5 };
        const mockComplaint = {
            userId: req.user.id,
            feedback: {},
            save: sinon.stub().resolvesThis(),
        };
        sinon.stub(Complaint, 'findOne').resolves(mockComplaint);
        sinon.stub(User, 'findOne').resolves({}); 

        await saveFeedback(req, res);

        expect(mockComplaint.feedback.rating).to.equal(5);
        expect(mockComplaint.save.calledOnce).to.be.true;
    });
  });
});
