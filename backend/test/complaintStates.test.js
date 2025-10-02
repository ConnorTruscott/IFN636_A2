const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

// Import the state classes to be tested
const {
  ReceivedState,
  ResolvingState,
  ClosedState,
} = require('../design_patterns/complaintStates');

// Mock the dependencies to isolate our test subjects
const notificationService = require('../design_patterns/NotificationService');

describe('Complaint State Machine', () => {
  let mockComplaint, mockWrapper, notificationServiceStub;

  beforeEach(() => {
    // Create fresh mock objects before each test
    mockComplaint = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      status: '',
      statusTimestamps: {},
    };

    mockWrapper = {
      setState: sinon.spy(), // A spy to watch if this method gets called
    };

    // Stub all methods of the notificationService to prevent actual notifications
    notificationServiceStub = sinon.stub(notificationService);
  });

  afterEach(() => {
    sinon.restore(); // Clean up all stubs and spies
  });


  // --- Tests for ReceivedState ---
  describe('ReceivedState', () => {
    it('enter() should set status and timestamp', async () => {
      const state = new ReceivedState(mockComplaint, mockWrapper);
      await state.enter();

      expect(mockComplaint.status).to.equal('received');
      expect(mockComplaint.statusTimestamps.received).to.be.an.instanceOf(Date);
    });

    it('updateStatus() should transition to ResolvingState', async () => {
      const state = new ReceivedState(mockComplaint, mockWrapper);
      await state.updateStatus('resolving');

      expect(mockWrapper.setState.calledOnce).to.be.true;
      // Check that the new state passed to the wrapper is the correct type
      expect(mockWrapper.setState.firstCall.args[0]).to.be.an.instanceOf(ResolvingState);
    });

    it('updateStatus() should transition to ClosedState', async () => {
        const state = new ReceivedState(mockComplaint, mockWrapper);
        await state.updateStatus('closed');
  
        expect(mockWrapper.setState.calledOnce).to.be.true;
        expect(mockWrapper.setState.firstCall.args[0]).to.be.an.instanceOf(ClosedState);
    });

    it('updateStatus() should throw an error for an invalid transition', async () => {
      const state = new ReceivedState(mockComplaint, mockWrapper);
      try {
        await state.updateStatus('invalid_status');
        // If it doesn't throw, fail the test
        expect.fail('Expected updateStatus to throw an error, but it did not.');
      } catch (error) {
        expect(error.message).to.equal('Invalid state change');
      }
    });
  });


  // --- Tests for ResolvingState ---
  describe('ResolvingState', () => {
    it('enter() should set status, timestamp, and send a notification', async () => {
      const state = new ResolvingState(mockComplaint, mockWrapper);
      await state.enter();

      expect(mockComplaint.status).to.equal('resolving');
      expect(mockComplaint.statusTimestamps.resolving).to.be.an.instanceOf(Date);
      // Verify that the notification was sent
      expect(notificationServiceStub.complaintStatusUpdated.calledOnceWith(mockComplaint.userId, mockComplaint._id, 'resolving')).to.be.true;
    });

    it('updateStatus() should transition to ClosedState', async () => {
      const state = new ResolvingState(mockComplaint, mockWrapper);
      await state.updateStatus('closed');

      expect(mockWrapper.setState.calledOnce).to.be.true;
      expect(mockWrapper.setState.firstCall.args[0]).to.be.an.instanceOf(ClosedState);
    });

    it('updateStatus() should throw an error for an invalid transition (e.g., back to received)', async () => {
      const state = new ResolvingState(mockComplaint, mockWrapper);
      try {
        await state.updateStatus('received');
        expect.fail('Expected updateStatus to throw an error.');
      } catch (error) {
        expect(error.message).to.equal('Invalid state change');
      }
    });
  });


  // --- Tests for ClosedState ---
  describe('ClosedState', () => {
    it('enter() should set status, timestamp, completed flag, and send notification', async () => {
      const state = new ClosedState(mockComplaint, mockWrapper);
      await state.enter();

      expect(mockComplaint.status).to.equal('closed');
      expect(mockComplaint.statusTimestamps.closed).to.be.an.instanceOf(Date);
      expect(mockComplaint.completed).to.be.true;
      expect(notificationServiceStub.complaintStatusUpdated.calledOnce).to.be.true;
    });

    it('updateStatus() should ALWAYS throw an error', async () => {
      const state = new ClosedState(mockComplaint, mockWrapper);
      try {
        await state.updateStatus('resolving'); // Try to move to any state
        expect.fail('A closed complaint should not be updatable.');
      } catch (error) {
        expect(error.message).to.equal('Cannot update a closed complaint');
      }
    });
  });
});