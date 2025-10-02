const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import Models and dependencies to be mocked
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const notificationService = require('../design_patterns/NotificationService');

// Import the controller functions to be tested
const {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
} = require('../controllers/authController');

describe('Auth Controller', () => {
  let res;
  beforeEach(() => {
    // Create a fresh mock response object before each test
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    // Restore all stubs after each test
    sinon.restore();
  });

  // --- Tests for registerUser ---
  describe('registerUser', () => {
    it('should register a new student successfully and return 201', async () => {
      const req = {
        body: {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          password: 'password123',
          studentNumber: 's1234567',
        },
      };
      const mockUser = { _id: new mongoose.Types.ObjectId(), ...req.body, role: 'Student' };

      sinon.stub(User, 'findOne').resolves(null); // User does not exist
      sinon.stub(User, 'create').resolves(mockUser);
      sinon.stub(notificationService, 'subscribe');
      sinon.stub(notificationService, 'userRegistered');
      sinon.stub(notificationService, 'unsubscribe');
      sinon.stub(jwt, 'sign').returns('mock_jwt_token');

      await registerUser(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWithMatch({ email: 'jane.doe@example.com', token: 'mock_jwt_token' })).to.be.true;
    });

    it('should return 400 if user already exists', async () => {
      const req = { body: { email: 'jane.doe@example.com' } };
      sinon.stub(User, 'findOne').resolves({ email: 'jane.doe@example.com' }); // User exists

      await registerUser(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'User already exists' })).to.be.true;
    });
    
    it('should allow an admin to register a new staff member', async () => {
        const req = {
            user: { role: 'Admin' }, // Mock an admin user making the request
            body: {
              name: 'Staff Member',
              email: 'staff@example.com',
              password: 'password123',
              role: 'Staff',
              department: 'Library'
            },
          };
          const mockUser = { _id: new mongoose.Types.ObjectId(), ...req.body };

          sinon.stub(User, 'findOne').resolves(null);
          sinon.stub(User, 'create').resolves(mockUser);
          sinon.stub(notificationService, 'userRegistered');

          await registerUser(req, res);

          expect(res.status.calledWith(201)).to.be.true;
          expect(res.json.calledWithMatch({ role: 'Staff', department: 'Library' })).to.be.true;
    });

    it('should return 500 on a database error', async () => {
      const req = { body: {} };
      sinon.stub(User, 'findOne').throws(new Error('Database connection failed'));

      await registerUser(req, res);

      expect(res.status.calledWith(500)).to.be.true;
    });
  });

  // --- Tests for loginUser ---
  describe('loginUser', () => {
    it('should login a user successfully with correct credentials', async () => {
      const req = { body: { email: 'test@example.com', password: 'password123' } };
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashed_password',
      };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(true); // Passwords match
      sinon.stub(jwt, 'sign').returns('mock_jwt_token');

      await loginUser(req, res);

      expect(res.json.calledWithMatch({ email: 'test@example.com', token: 'mock_jwt_token' })).to.be.true;
    });

    it('should return 401 for an incorrect password', async () => {
      const req = { body: { email: 'test@example.com', password: 'wrong_password' } };
      const mockUser = { _id: new mongoose.Types.ObjectId(), password: 'hashed_password' };

      sinon.stub(User, 'findOne').resolves(mockUser);
      sinon.stub(bcrypt, 'compare').resolves(false); // Passwords do not match

      await loginUser(req, res);

      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Invalid email or password' })).to.be.true;
    });

    it('should return 401 if user email is not found', async () => {
      const req = { body: { email: 'notfound@example.com', password: 'password123' } };
      sinon.stub(User, 'findOne').resolves(null); // User not found

      await loginUser(req, res);

      expect(res.status.calledWith(401)).to.be.true;
    });
  });

  // --- Tests for getProfile ---
  describe('getProfile', () => {
    it('should return the user profile for an authenticated user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = { user: { id: userId } };
      const mockProfile = { name: 'Test User', email: 'test@example.com' };

      sinon.stub(User, 'findById').withArgs(userId).resolves(mockProfile);

      await getProfile(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockProfile)).to.be.true;
    });

    it('should return 404 if user is not found', async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() } };
        sinon.stub(User, 'findById').resolves(null);
  
        await getProfile(req, res);
  
        expect(res.status.calledWith(404)).to.be.true;
    });
  });

  // --- Tests for updateUserProfile ---
  describe('updateUserProfile', () => {
    it('should update the user profile successfully', async () => {
        const userId = new mongoose.Types.ObjectId();
        const mockUser = {
            _id: userId,
            name: 'Old Name',
            phone: '1111',
            save: sinon.stub().resolvesThis(), // Stub the .save() method
        };
        const req = {
            user: { id: userId },
            body: { name: 'New Name', phone: '9999' },
        };

        sinon.stub(User, 'findById').withArgs(userId).resolves(mockUser);
        sinon.stub(jwt, 'sign').returns('new_mock_token');

        await updateUserProfile(req, res);

        expect(mockUser.name).to.equal('New Name');
        expect(mockUser.phone).to.equal('9999');
        expect(mockUser.save.calledOnce).to.be.true;
        expect(res.json.calledWithMatch({ name: 'New Name', token: 'new_mock_token' })).to.be.true;
    });
  });
});