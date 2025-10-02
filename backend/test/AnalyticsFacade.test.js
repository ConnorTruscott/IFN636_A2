const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

// Import the Facade to be tested
const AnalyticsFacade = require('../design_patterns/AnalyticsFacade');
// We don't need the real model, just a mock object for stubbing
const Complaint = require('../models/Complaint');

describe('AnalyticsFacade and Services', () => {
    afterEach(() => {
        sinon.restore();
    });

    describe('AnalyticsFacade', () => {
        it('should call all services and aggregate their data correctly', async () => {
            // Mock the data that will be returned by the database calls
            const mockComplaints = [
                { status: 'received', category: 'IT', createdAt: '2025-10-01T10:00:00.000Z' },
                { status: 'resolving', category: 'IT', createdAt: '2025-10-01T11:00:00.000Z' },
                { status: 'closed', category: 'HR', createdAt: '2025-10-02T12:00:00.000Z', feedback: { rating: 4 } },
                { status: 'closed', category: 'IT', createdAt: '2025-10-02T13:00:00.000Z', feedback: { rating: 5 } },
            ];

            // Stub all the necessary Mongoose methods
            sinon.stub(Complaint, 'countDocuments')
                .withArgs().resolves(4)
                .withArgs({ status: 'received' }).resolves(1)
                .withArgs({ status: 'resolving' }).resolves(1)
                .withArgs({ status: 'closed' }).resolves(2);
            
            const findStub = sinon.stub(Complaint, 'find');


            findStub.callsFake((query = {}) => {
            let result;
            if (query.status === 'closed'){
                result = [mockComplaints[2], mockComplaints[3]];
            } else {
                result = mockComplaints;
            }

            const chainable = {
                sort: () => chainable,
                exec: async () => result,
                then: (resolve) => Promise.resolve(result).then(resolve),
            };

            return chainable;
            });

            // Now, create the facade and run the test
            const facade = new AnalyticsFacade(Complaint);
            const result = await facade.getAnalytics();

            // Assert the aggregated results
            expect(result.total).to.equal(4);
            expect(result.received).to.equal(1);
            expect(result.avgRating).to.equal(4.5);
            expect(result.categoryBreakdown.IT.received).to.equal(1);
            expect(result.trend).to.be.an('array').with.lengthOf(2);
        });
    });
});