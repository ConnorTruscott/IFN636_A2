const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Department = require('../models/Department');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');

describe('Department Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: { id: new mongoose.Types.ObjectId() },
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getDepartments', () => {
    it('should return a list of all departments', async () => {
      const mockDepts = [{ name: 'IT' }, { name: 'HR' }];
      sinon.stub(Department, 'find').resolves(mockDepts);
      await getDepartments(req, res);
      expect(res.json.calledWith(mockDepts)).to.be.true;
    });
  });

  describe('createDepartment', () => {
    it('should create a new department and return 201', async () => {
      req.body = { name: 'Facilities', description: 'Campus facilities management' };
      const mockDept = { _id: new mongoose.Types.ObjectId(), ...req.body };
      sinon.stub(Department, 'create').resolves(mockDept);
      await createDepartment(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockDept)).to.be.true;
    });
  });

  describe('updateDepartment', () => {
    it('should update a department successfully', async () => {
      req.body = { name: 'Information Technology', description: 'Updated description' };
      const mockUpdatedDept = { _id: req.params.id, ...req.body };
      sinon.stub(Department, 'findByIdAndUpdate').resolves(mockUpdatedDept);
      await updateDepartment(req, res);
      expect(res.json.calledWith(mockUpdatedDept)).to.be.true;
    });
  });

  describe('deleteDepartment', () => {
    it('should delete a department successfully', async () => {
      sinon.stub(Department, 'findByIdAndDelete').resolves({});
      await deleteDepartment(req, res);
      expect(res.json.calledWith({ message: 'Department Deleted' })).to.be.true;
    });
  });
});
