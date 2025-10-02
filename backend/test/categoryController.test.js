const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import the Model to be mocked
const Category = require('../models/Category');

// Import the controller functions to be tested
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

describe('Category Controller', () => {
  let req, res;

  beforeEach(() => {
    // Create fresh mock objects before each test
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
    sinon.restore(); // Clean up all stubs
  });

  // --- Tests for listCategories ---
  describe('listCategories', () => {
    it('should return a list of categories sorted by name', async () => {
      const mockCategories = [{ name: 'Academics' }, { name: 'Facilities' }];
      const sortStub = sinon.stub().resolves(mockCategories);
      sinon.stub(Category, 'find').returns({ sort: sortStub });

      await listCategories(req, res);

      expect(sortStub.calledWith({ name: 1 })).to.be.true;
      expect(res.json.calledWith(mockCategories)).to.be.true;
    });

    it('should return 500 on a database error', async () => {
        sinon.stub(Category, 'find').throws(new Error('DB Error'));
        await listCategories(req, res);
        expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // --- Tests for createCategory ---
  describe('createCategory', () => {
    it('should create a new category and return 201', async () => {
      req.body.name = 'New Category';
      const mockCategory = { _id: new mongoose.Types.ObjectId(), name: 'New Category' };
      sinon.stub(Category, 'create').resolves(mockCategory);

      await createCategory(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockCategory)).to.be.true;
    });

    it('should return 400 if name is missing', async () => {
      req.body.name = ''; // Empty name
      await createCategory(req, res);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should return 409 if category already exists (duplicate key error)', async () => {
      req.body.name = 'Existing Category';
      const dbError = new Error('Duplicate key');
      dbError.code = 11000; // Simulate MongoDB duplicate key error code
      sinon.stub(Category, 'create').throws(dbError);

      await createCategory(req, res);

      expect(res.status.calledWith(409)).to.be.true;
      expect(res.json.calledWith({ message: 'Category already exists' })).to.be.true;
    });
  });

  // --- Tests for updateCategory ---
  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      req.body.name = 'Updated Name';
      const mockCategory = {
        name: 'Old Name',
        save: sinon.stub().resolves({ name: 'Updated Name' }),
      };
      sinon.stub(Category, 'findById').resolves(mockCategory);

      await updateCategory(req, res);

      expect(mockCategory.name).to.equal('Updated Name');
      expect(mockCategory.save.calledOnce).to.be.true;
      expect(res.json.calledOnce).to.be.true;
    });

    it('should return 404 if category to update is not found', async () => {
      sinon.stub(Category, 'findById').resolves(null);
      await updateCategory(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });

    it('should return 400 if name is missing for update', async () => {
        req.body.name = '';
        sinon.stub(Category, 'findById').resolves({});
        await updateCategory(req, res);
        expect(res.status.calledWith(400)).to.be.true;
      });
  });

  // --- Tests for deleteCategory ---
  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      const mockCategory = { deleteOne: sinon.stub().resolves() };
      sinon.stub(Category, 'findById').resolves(mockCategory);

      await deleteCategory(req, res);

      expect(mockCategory.deleteOne.calledOnce).to.be.true;
      expect(res.json.calledWith({ message: 'Category deleted' })).to.be.true;
    });

    it('should return 404 if category to delete is not found', async () => {
      sinon.stub(Category, 'findById').resolves(null);
      await deleteCategory(req, res);
      expect(res.status.calledWith(404)).to.be.true;
    });
  });
});