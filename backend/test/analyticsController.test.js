const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

// Import the controller and all its dependencies to be mocked
const { getAnalytics } = require('../controllers/analyticsController');
const AnalyticsFacade = require('../design_patterns/AnalyticsFacade');

// Import all decorators. We need access to their prototypes to stub them.
const {
  SystemInfoWarning,
  ComplaintVolumeWarning,
  CategoryVolumeWarning,
  RatingWarning,
  TrendWarning,
} = require('../design_patterns/WarningDecorator');


describe('Analytics Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    // To test the controller in isolation, we stub the constructors of the
    // facade and decorators to prevent their actual code from running.
    sinon.stub(AnalyticsFacade.prototype);
    sinon.stub(ComplaintVolumeWarning.prototype);
    sinon.stub(CategoryVolumeWarning.prototype);
    sinon.stub(RatingWarning.prototype);
    sinon.stub(TrendWarning.prototype);
    sinon.stub(SystemInfoWarning.prototype);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getAnalytics', () => {
    it('should correctly assemble the decorator chain and return analytics data', async () => {
      const mockAnalyticsResult = {
        totalComplaints: 100,
        averageRating: 4.5,
        warnings: ['High complaint volume'],
      };

      // We only need to stub the `getAnalytics` method on the FINAL decorator in the chain.
      // The controller calls getAnalytics() on the SystemInfoWarning instance.
      SystemInfoWarning.prototype.getAnalytics.resolves(mockAnalyticsResult);

      await getAnalytics(req, res);

      // Verify that the final method in the chain was called
      expect(SystemInfoWarning.prototype.getAnalytics.calledOnce).to.be.true;
      
      // Verify that the response was sent correctly
      expect(res.json.calledWith(mockAnalyticsResult)).to.be.true;
      expect(res.status.called).to.be.false;
    });

    it('should return 500 if an error occurs during analytics generation', async () => {
      const errorMessage = 'Analytics generation failed';
      // Make the final method in the chain throw an error
      SystemInfoWarning.prototype.getAnalytics.throws(new Error(errorMessage));

      await getAnalytics(req, res);

      // Verify that the error was caught and the correct response was sent
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: errorMessage })).to.be.true;
    });
  });
});
