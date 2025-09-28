const Complaint = require('../models/Complaint');
const AnalyticsFacade = require('../design_patterns/AnalyticsFacade');
const WarningDecorator = require('../design_patterns/WarningDecorator');

const analyticsFacade = new AnalyticsFacade(Complaint); 
const decoratedAnalytics = new WarningDecorator(analyticsFacade);

// GET ANALYTICS
const getAnalytics = async (req, res) => {
  try {
    const data = await decoratedAnalytics.getAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getAnalytics };