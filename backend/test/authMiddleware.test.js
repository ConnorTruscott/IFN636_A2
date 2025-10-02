const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import Models and dependencies to be mocked
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Import the middleware functions to be tested
const { protect, isAdmin, isStaff } = require('../middleware/authMiddleware');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Before each test, create fresh mock objects
    req = {
      headers: {},
      user: null, // Ensure user is null before protect runs
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    next = sinon.spy(); // A spy to see if next() is called
  });

  afterEach(() => {
    sinon.restore(); // Clean up all stubs
  });

  // --- Tests for protect middleware ---
  describe('protect', () => {
    it('should call next() and attach user to req if token is valid', async () => {
      const userId = new mongoose.Types.ObjectId();
      req.headers.authorization = 'Bearer valid_token_string';
      const mockUser = { _id: userId, name: 'Test User', role: 'Student' };

      // Mock the dependencies' functions
      sinon.stub(jwt, 'verify').returns({ id: userId });
      sinon.stub(User, 'findById').returns({
        select: sinon.stub().resolves(mockUser),
      });

      await protect(req, res, next);

      expect(next.calledOnce).to.be.true; // Should proceed to the next middleware
      expect(res.status.called).to.be.false; // Should not send a status
      expect(req.user).to.exist;
      expect(req.user.name).to.equal('Test User');
    });

    it('should return 401 if no token is provided', async () => {
      req.headers.authorization = undefined;

      await protect(req, res, next);

      expect(next.called).to.be.false; // Should NOT proceed
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Not authorized, no token' })).to.be.true;
    });

    it('should return 401 if token is invalid or expired', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      sinon.stub(jwt, 'verify').throws(new Error('Invalid token'));

      await protect(req, res, next);

      expect(next.called).to.be.false;
      expect(res.status.calledWith(401)).to.be.true;
      expect(res.json.calledWith({ message: 'Not authorized, token failed' })).to.be.true;
    });

    it('should call next() even if user is not found in DB (subsequent middleware should handle)', async () => {
        // This tests the current behavior of your code.
        // A potential improvement is to throw a 401 error here if the user is null.
        req.headers.authorization = 'Bearer valid_token_for_deleted_user';
        sinon.stub(jwt, 'verify').returns({ id: new mongoose.Types.ObjectId() });
        sinon.stub(User, 'findById').returns({
          select: sinon.stub().resolves(null), // User not found
        });
  
        await protect(req, res, next);
  
        expect(next.calledOnce).to.be.true;
        expect(req.user).to.be.null; // req.user is null, which is handled by isAdmin/isStaff
    });
  });

  // --- Tests for isAdmin middleware ---
  describe('isAdmin', () => {
    it('should call next() if user has Admin role', () => {
      req.user = { role: 'Admin' };
      isAdmin(req, res, next);
      expect(next.calledOnce).to.be.true;
    });

    it('should return 403 if user does not have Admin role', () => {
      req.user = { role: 'Student' };
      isAdmin(req, res, next);
      expect(next.called).to.be.false;
      expect(res.status.calledWith(403)).to.be.true;
    });

    it('should return 403 if there is no user on the request', () => {
      req.user = null; // e.g., from protect middleware if user was deleted
      isAdmin(req, res, next);
      expect(next.called).to.be.false;
      expect(res.status.calledWith(403)).to.be.true;
    });
  });

   // --- Tests for isStaff middleware ---
   describe('isStaff', () => {
    it('should call next() if user has Staff role', () => {
      req.user = { role: 'Staff' };
      isStaff(req, res, next);
      expect(next.calledOnce).to.be.true;
    });

    it('should return 403 if user does not have Staff role', () => {
      req.user = { role: 'Admin' }; // An admin is not a staff member in this logic
      isStaff(req, res, next);
      expect(next.called).to.be.false;
      expect(res.status.calledWith(403)).to.be.true;
    });
  });
});