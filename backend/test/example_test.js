const chai = require('chai');
// const chaiHttp = require('chai-http');
// const http = require('http');
// const app = require('../server');
// const connectDB = require('../config/db');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Complaint = require('../models/Complaint');
const { updateComplaint, getComplaints, addComplaint, deleteComplaint } = require('../controllers/complaintController');
const { expect } = chai;

// chai.use(chaiHttp);

describe('AddComplaint Function Test', () => {
  it('should create a new complaint successfully', async () => {
    // Mock request data (use "date" instead of "deadline")
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: 'New Complaint', description: 'Complaint description', date: '2025-12-31' },
    };

    // Mock complaint returned from model
    const createdComplaint = { _id: new mongoose.Types.ObjectId(), userId: req.user.id, ...req.body, status: 'received'};

    // Stub create
    const createStub = sinon.stub(Complaint, 'create').resolves(createdComplaint);

    // Mock res
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComplaint(req, res);

    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdComplaint)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const createStub = sinon.stub(Complaint, 'create').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: 'New Complaint', description: 'Complaint description', date: '2025-12-31' },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await addComplaint(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });
});

describe('Update Function Test', () => {
  it('should update complaint successfully', async () => {
    const complaintId = new mongoose.Types.ObjectId();

    // Use "date" on the existing document
    const existingComplaint = {
      _id: complaintId,
      title: 'Old Complaint',
      description: 'Old Description',
      completed: false,
      date: new Date(),
      save: sinon.stub().resolvesThis(),
    };

    const findByIdStub = sinon.stub(Complaint, 'findById').resolves(existingComplaint);

    const req = {
      params: { id: complaintId },
      body: { title: 'New Complaint', completed: true },
    };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await updateComplaint(req, res);

    expect(existingComplaint.title).to.equal('New Complaint');
    expect(existingComplaint.completed).to.equal(true);
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if complaint is not found', async () => {
    const findByIdStub = sinon.stub(Complaint, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateComplaint(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Complaint not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 on error', async () => {
    const findByIdStub = sinon.stub(Complaint, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await updateComplaint(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;

    findByIdStub.restore();
  });
});

describe('GetComplaint Function Test', () => {
  it('should return complaints for the given user', async () => {
    const userId = new mongoose.Types.ObjectId();

    const complaints = [
      { _id: new mongoose.Types.ObjectId(), title: 'Complaint 1', userId },
      { _id: new mongoose.Types.ObjectId(), title: 'Complaint 2', userId },
    ];

    const findStub = sinon.stub(Complaint, 'find').resolves(complaints);

    const req = { user: { id: userId } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getComplaints(req, res);

    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(complaints)).to.be.true;
    expect(res.status.called).to.be.false;

    findStub.restore();
  });

  it('should return 500 on error', async () => {
    const findStub = sinon.stub(Complaint, 'find').throws(new Error('DB Error'));

    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis(),
    };

    await getComplaints(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findStub.restore();
  });
});

describe('DeleteComplaint Function Test', () => {
  it('should delete a complaint successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    const complaint = { remove: sinon.stub().resolves() };

    const findByIdStub = sinon.stub(Complaint, 'findById').resolves(complaint);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await deleteComplaint(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(complaint.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Complaint deleted' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if complaint is not found', async () => {
    const findByIdStub = sinon.stub(Complaint, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await deleteComplaint(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Complaint not found' })).to.be.true;

    findByIdStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const findByIdStub = sinon.stub(Complaint, 'findById').throws(new Error('DB Error'));

    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await deleteComplaint(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    findByIdStub.restore();
  });
});
