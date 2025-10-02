const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

const {
  SystemInfoWarning,
  ComplaintVolumeWarning,
  CategoryVolumeWarning,
  RatingWarning,
  TrendWarning,
} = require('../design_patterns/WarningDecorator');

// A helper to create a mock component for decorators to wrap
const createMockComponent = (initialData) => ({
    getAnalytics: sinon.stub().resolves(initialData),
});

describe('Analytics Decorators', () => {

    it('SystemInfoWarning should always add an info message', async () => {
        const mockData = { warnings: [] };
        const component = createMockComponent(mockData);
        const decorator = new SystemInfoWarning(component);

        const result = await decorator.getAnalytics();

        expect(result.warnings).to.have.lengthOf(1);
        expect(result.warnings[0].level).to.equal('info');
    });

    it('ComplaintVolumeWarning should add a warning if received count is high', async () => {
        const mockData = { received: 15, warnings: [] }; // Above default threshold of 10
        const component = createMockComponent(mockData);
        const decorator = new ComplaintVolumeWarning(component);

        const result = await decorator.getAnalytics();
        
        expect(result.warnings[0].level).to.equal('critical');
    });

    it('ComplaintVolumeWarning should NOT add a warning if received count is low', async () => {
        const mockData = { received: 5, warnings: [] }; // Below threshold
        const component = createMockComponent(mockData);
        const decorator = new ComplaintVolumeWarning(component);

        const result = await decorator.getAnalytics();
        
        expect(result.warnings).to.have.lengthOf(0);
    });

    it('CategoryVolumeWarning should add a warning for the category with most complaints', async () => {
        const mockData = {
            categoryBreakdown: {
                'IT': { received: 10, resolving: 1, closed: 1 },
                'HR': { received: 2, resolving: 3, closed: 5 },
            },
            warnings: [],
        };
        const component = createMockComponent(mockData);
        const decorator = new CategoryVolumeWarning(component);

        const result = await decorator.getAnalytics();
        
        expect(result.warnings[0].message).to.include('"IT"');
    });

    it('RatingWarning should add a warning for a low average rating', async () => {
        const mockData = { avgRating: 2.5, warnings: [] }; // Below default threshold of 3
        const component = createMockComponent(mockData);
        const decorator = new RatingWarning(component);

        const result = await decorator.getAnalytics();

        expect(result.warnings[0].level).to.equal('warning');
        expect(result.warnings[0].message).to.include('Low student satisfaction');
    });

    it('TrendWarning should add a warning for a consistently rising trend', async () => {
        const mockData = {
            trend: [
                { date: '2025-10-01', total: 5 },
                { date: '2025-10-02', total: 7 },
                { date: '2025-10-03', total: 8 },
            ],
            warnings: [],
        };
        const component = createMockComponent(mockData);
        const decorator = new TrendWarning(component);

        const result = await decorator.getAnalytics();

        expect(result.warnings[0].level).to.equal('warning');
        expect(result.warnings[0].message).to.include('have been rising');
    });
});