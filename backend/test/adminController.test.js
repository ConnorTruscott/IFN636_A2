const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import Models and other dependencies
const User = require('../models/User');
const { Admin } = require('../models/UserRoles');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const ComplaintWrapper = require('../design_patterns/complaintStatesWrapper');
const notificationService = require('../design_patterns/NotificationService');

// Import the controller functions to be tested
const {
  createStaff,
  listStaff,
  deleteStaff,
  updateStaffDepartment,
  getAllComplaints,
  adminGetComplaintById,
  adminUpdateComplaint,
  adminDeleteComplaint,
  getComplaintMeta,
} = require('../controllers/adminController');

describe('Admin Controller', () => {
  // Mock response object for all tests
  let res;
  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  // Restore all stubs after each test to ensure isolation
  afterEach(() => {
    sinon.restore();
  });

  // --- Tests for createStaff ---
  describe('createStaff', () => {
    it('should create a new staff member and return 201', async () => {
      const req = {
        user: { _id: new mongoose.Types.ObjectId(), role: 'Admin' },
        body: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          department: 'IT',
        },
      };

      const mockNewStaff = { user: { ...req.body, role: 'Staff' } };
      const mockSavedStaff = { _id: new mongoose.Types.ObjectId(), ...mockNewStaff.user };

      // Stub the methods called within the controller
      sinon.stub(Admin.prototype, 'createStaff').resolves(mockNewStaff);
      sinon.stub(User, 'create').resolves(mockSavedStaff);
      sinon.stub(notificationService, 'userRegistered'); // Stub to prevent side effects

      await createStaff(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockSavedStaff)).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      const req = { user: {}, body: {} };
      sinon.stub(Admin.prototype, 'createStaff').throws(new Error('Database error'));

      await createStaff(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Database error' })).to.be.true;
    });
  });

  // --- Tests for listStaff ---
  describe('listStaff', () => {
    it('should return a list of staff members', async () => {
      const mockStaffList = [{ name: 'Staff1' }, { name: 'Staff2' }];
      sinon.stub(User, 'find').withArgs({ role: 'Staff' }).resolves(mockStaffList);

      await listStaff({}, res);

      expect(res.json.calledWith(mockStaffList)).to.be.true;
    });
  });

  // --- Tests for deleteStaff ---
  describe('deleteStaff', () => {
    it('should delete a staff member and return a success message', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      sinon.stub(User, 'findOneAndDelete').resolves({ _id: req.params.id }); // Found and deleted

      await deleteStaff(req, res);

      expect(res.json.calledWith({ message: 'Staff deleted successfully' })).to.be.true;
    });

    it('should return 404 if staff member not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      sinon.stub(User, 'findOneAndDelete').resolves(null); // Not found

      await deleteStaff(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Staff not found' })).to.be.true;
    });
  });

  // --- Tests for updateStaffDepartment ---
  describe('updateStaffDepartment', () => {
    it('should update a staff members department successfully', async () => {
      const req = {
        params: { id: new mongoose.Types.ObjectId() },
        body: { department: 'HR' },
      };
      const updatedStaff = { _id: req.params.id, department: 'HR' };
      sinon.stub(User, 'findOneAndUpdate').resolves(updatedStaff);

      await updateStaffDepartment(req, res);

      expect(res.json.calledWith(updatedStaff)).to.be.true;
    });

    it('should return 404 if staff member to update is not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: { department: 'HR' } };
      sinon.stub(User, 'findOneAndUpdate').resolves(null);

      await updateStaffDepartment(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // --- Tests for adminGetComplaintById ---
  describe('adminGetComplaintById', () => {
    it('should return a complaint with enriched data', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      const mockComplaint = { _id: req.params.id, title: 'Test Complaint', toObject: () => mockComplaint }; // for lean simulation
      const findByIdStub = sinon.stub(Complaint, 'findById').returns({
        populate: sinon.stub().returns({
          lean: sinon.stub().resolves(mockComplaint),
        }),
      });

      await adminGetComplaintById(req, res);

      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.json.calledWithMatch({ title: 'Test Complaint' })).to.be.true;
    });

    it('should return 404 if complaint not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() } };
      sinon.stub(Complaint, 'findById').returns({
        populate: sinon.stub().returns({
          lean: sinon.stub().resolves(null),
        }),
      });

      await adminGetComplaintById(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // --- Tests for adminUpdateComplaint ---
  describe('adminUpdateComplaint', () => {
    it('should update a complaint successfully', async () => {
      const complaintId = new mongoose.Types.ObjectId();
      const mockComplaint = {
        _id: complaintId,
        title: 'Original Title',
        status: 'received',
        save: sinon.stub().resolvesThis(),
      };
      const req = {
        params: { id: complaintId },
        body: { title: 'Updated Title', status: 'resolving' },
      };

      sinon.stub(Complaint, 'findById').resolves(mockComplaint);
      // Stub the wrapper to avoid testing its internal logic here
      sinon.stub(ComplaintWrapper.prototype, 'updateStatus').resolves();

      await adminUpdateComplaint(req, res);
      
      expect(mockComplaint.save.calledOnce).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].title).to.equal('Updated Title');
    });

    it('should return 404 if complaint to update is not found', async () => {
      const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
      sinon.stub(Complaint, 'findById').resolves(null);

      await adminUpdateComplaint(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('should return 400 for an invalid status transition', async () => {
        const complaintId = new mongoose.Types.ObjectId();
        const mockComplaint = { _id: complaintId, status: 'closed' }; // A closed complaint
        const req = {
          params: { id: complaintId },
          body: { status: 'received' }, // Invalid transition
        };
  
        sinon.stub(Complaint, 'findById').resolves(mockComplaint);
        // Make the wrapper throw the expected error
        sinon.stub(ComplaintWrapper.prototype, 'updateStatus').throws(new Error('Cannot update a closed complaint'));
  
        await adminUpdateComplaint(req, res);
  
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'Cannot update a closed complaint' })).to.be.true;
      });
  });

  // --- Tests for adminDeleteComplaint ---
  describe('adminDeleteComplaint', () => {
    it('should delete a complaint successfully', async () => {
        const complaintId = new mongoose.Types.ObjectId();
        const mockComplaint = {
            _id: complaintId,
            deleteOne: sinon.stub().resolves(),
        };
        const req = {
            params: { id: complaintId },
            body: { reason: 'Resolved offline' },
        };

        sinon.stub(Complaint, 'findById').resolves(mockComplaint);

        await adminDeleteComplaint(req, res);

        expect(mockComplaint.deleteOne.calledOnce).to.be.true;
        expect(res.json.calledWith({ message: 'Complaint deleted', reason: 'Resolved offline' })).to.be.true;
    });

    it('should return 400 if reason for deletion is missing', async () => {
        const req = { params: { id: new mongoose.Types.ObjectId() }, body: { reason: '' } };

        await adminDeleteComplaint(req, res);

        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledWith({ message: 'Delete reason is required' })).to.be.true;
    });
  });
});