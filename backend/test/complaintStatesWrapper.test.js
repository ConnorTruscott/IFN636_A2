const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

// We must mock the state classes because we don't have the actual file yet.
// This allows us to test the Wrapper in isolation.
class MockState {
    constructor() {
        this.enter = sinon.stub().resolves();
        this.updateStatus = sinon.stub().resolves();
    }
}
class ReceivedState extends MockState {}
class ResolvingState extends MockState {}
class ClosedState extends MockState {}

// Now, we can require the ComplaintWrapper. It will use our mock states.
// CORRECT
const ComplaintWrapper = require('../design_patterns/complaintStatesWrapper');

// We need to use sinon.stub to replace the real state classes with our mocks.
// This is a more advanced technique for testing modules with dependencies.
const states = require('../design_patterns/complaintStates');

describe('ComplaintWrapper', () => {

    afterEach(() => {
        sinon.restore();
    });

    describe('Initialization', () => {
        // To properly test this in isolation, we stub the dependency module.
        let receivedStub, resolvingStub, closedStub;
        
        // This beforeEach runs before each 'it' block in this 'describe' block.
        beforeEach(() => {
            receivedStub = sinon.stub(states, 'ReceivedState').returns(new ReceivedState());
            resolvingStub = sinon.stub(states, 'ResolvingState').returns(new ResolvingState());
            closedStub = sinon.stub(states, 'ClosedState').returns(new ClosedState());
        });

        it('should initialize to ReceivedState for status "received"', () => {
            const complaint = { status: 'received' };
            const wrapper = new ComplaintWrapper(complaint);
            
            expect(receivedStub.calledOnce).to.be.true;
            expect(wrapper.state).to.be.instanceOf(ReceivedState);
        });

        it('should initialize to ResolvingState for status "resolving"', () => {
            const complaint = { status: 'resolving' };
            const wrapper = new ComplaintWrapper(complaint);

            expect(resolvingStub.calledOnce).to.be.true;
            expect(wrapper.state).to.be.instanceOf(ResolvingState);
        });

        it('should initialize to ClosedState for status "closed"', () => {
            const complaint = { status: 'closed' };
            const wrapper = new ComplaintWrapper(complaint);

            expect(closedStub.calledOnce).to.be.true;
            expect(wrapper.state).to.be.instanceOf(ClosedState);
        });

        it('should default to ReceivedState for an unknown or missing status', () => {
            const complaint = { status: 'unknown_status' };
            const wrapper = new ComplaintWrapper(complaint);

            expect(receivedStub.calledOnce).to.be.true;
            expect(wrapper.state).to.be.instanceOf(ReceivedState);
        });
    });

    describe('Method Delegation', () => {
        it('should delegate the updateStatus call to the current state object', async () => {
            const complaint = { status: 'received' };
            // Since this file doesn't exist, we stub the require.
            // In a real scenario with the file present, we'd mock the class methods.
            const mockState = new MockState();
            sinon.stub(states, 'ReceivedState').returns(mockState);

            const wrapper = new ComplaintWrapper(complaint);
            const newStatus = 'resolving';

            await wrapper.updateStatus(newStatus);
            
            // Verify that the wrapper called the method on its state object
            expect(mockState.updateStatus.calledOnceWith(newStatus)).to.be.true;
        });

        it('should update its state and call enter() on the new state via setState', async () => {
            const complaint = { status: 'received' };
            sinon.stub(states, 'ReceivedState'); // Stub constructor

            const wrapper = new ComplaintWrapper(complaint);
            const newResolvingState = new ResolvingState(); // Create an instance of our mock

            await wrapper.setState(newResolvingState);

            // Verify that the internal state was updated
            expect(wrapper.state).to.equal(newResolvingState);
            // Verify that the 'enter' method of the new state was called
            expect(newResolvingState.enter.calledOnce).to.be.true;
        });
    });
});