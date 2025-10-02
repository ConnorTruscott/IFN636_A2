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
  addComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintsByCategory,
  updateComplaintStatusByStaff,
  saveFeedback,
  // ... import all other functions from the controller
} = require('../controllers/complaintController');


describe('Complaint Controller', () => {
  let res;
  let req;

  beforeEach(() => {
    // Create fresh mock request and response objects before each test
    req = {
      user: { id: new mongoose.Types.ObjectId(), department: 'IT' },
      params: { id: new mongoose.Types.ObjectId() },
      body: {},
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    // Stub the notification service for all tests to prevent side effects
    sinon.stub(notificationService);
  });

  afterEach(() => {
    sinon.restore(); // Clean up all stubs
  });

  // --- Tests for getComplaints (Student view) ---
  describe('getComplaints', () => {
    it('should return complaints for the logged-in user', async () => {
      const mockComplaints = [{ title: 'Complaint 1' }, { title: 'Complaint 2' }];
      sinon.stub(Complaint, 'find').withArgs({ userId: req.user.id }).resolves(mockComplaints);

      await getComplaints(req, res);

      expect(res.json.calledWith(mockComplaints)).to.be.true;
    });
  });

  // --- Tests for addComplaint ---
  describe('addComplaint', () => {
    it('should create a new complaint and return 201', async () => {
      req.body = { title: 'New Issue', category: 'IT' };
      const mockComplaint = { _id: new mongoose.Types.ObjectId(), ...req.body };
      
      sinon.stub(Complaint, 'create').resolves(mockComplaint);
      sinon.stub(User, 'find').resolves([]); // Assume no staff for simplicity

      await addComplaint(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockComplaint)).to.be.true;
    });

    it('should return 500 on creation error', async () => {
        sinon.stub(Complaint, 'create').throws(new Error('DB Error'));
        await addComplaint(req, res);
        expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // --- Tests for updateComplaint ---
  describe('updateComplaint', () => {
    it('should update a complaint successfully', async () => {
      const mockComplaint = {
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

  // --- Tests for deleteComplaint ---
  describe('deleteComplaint', () => {
    it('should delete a complaint successfully', async () => {
      const mockComplaint = { remove: sinon.stub().resolves() };
      sinon.stub(Complaint, 'findById').resolves(mockComplaint);

      await deleteComplaint(req, res);

      expect(mockComplaint.remove.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Complaint deleted' })).to.be.true;
    });
  });

  // --- Tests for getComplaintsByCategory (Staff view) ---
  describe('getComplaintsByCategory', () => {
    it('should return complaints matching the staff members department', async () => {
      const mockComplaints = [{ category: 'IT' }];
      // Mock a chained query
      const query = { populate: sinon.stub().returnsThis(), sort: sinon.stub().resolves(mockComplaints) };
      sinon.stub(Complaint, 'find').withArgs({ category: 'IT' }).returns(query);

      await getComplaintsByCategory(req, res);

      expect(res.json.calledWith(mockComplaints)).to.be.true;
    });

    it('should return 403 if staff has no department', async () => {
      req.user.department = null;
      await getComplaintsByCategory(req, res);
      expect(res.status.calledWith(403)).to.be.true;
    });
  });

  // --- Tests for updateComplaintStatusByStaff ---
  describe('updateComplaintStatusByStaff', () => {
    it('should allow staff to update a complaint in their department', async () => {
      req.body.status = 'resolving';
      const mockComplaint = { 
        category: 'IT',
        save: sinon.stub().resolvesThis(),
      };
      sinon.stub(Complaint, 'findById').resolves(mockComplaint);
      sinon.stub(ComplaintWrapper.prototype, 'updateStatus').resolves();

      await updateComplaintStatusByStaff(req, res);
      
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 403 if staff tries to update a complaint outside their department', async () => {
      const mockComplaint = { category: 'HR' }; // Different department
      sinon.stub(Complaint, 'findById').resolves(mockComplaint);

      await updateComplaintStatusByStaff(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });
  });

  // --- Tests for saveFeedback ---
  describe('saveFeedback', () => {
    it('should save feedback for a complaint successfully', async () => {
        req.body = { text: 'Great service', rating: 5 };
        const mockComplaint = {
            feedback: {},
            save: sinon.stub().resolvesThis(),
        };
        sinon.stub(Complaint, 'findOne').resolves(mockComplaint);
        sinon.stub(User, 'findOne').resolves({}); // Mock staff for notification

        await saveFeedback(req, res);

        expect(mockComplaint.feedback.rating).to.equal(5);
        expect(mockComplaint.save.calledOnce).to.be.true;
        expect(res.json.calledOnce).to.be.true;
    });

    it('should return 400 for an invalid rating', async () => {
        req.body = { rating: 6 }; // Invalid rating
        const mockComplaint = {};
        sinon.stub(Complaint, 'findOne').resolves(mockComplaint);

        await saveFeedback(req, res);

        expect(res.status.calledWith(400)).to.be.true;
    });
  });
});