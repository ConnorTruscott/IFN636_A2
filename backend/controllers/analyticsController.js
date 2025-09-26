const Complaint = require('../models/Complaint');
const AnalyticsFacade = require('../design_patterns/AnalyticsFacade');

const analyticsFacade = new AnalyticsFacade(Complaint); 

// GET ANALYTICS
const getAnalytics = async (req, res) => {
  try {
    const data = await analyticsFacade.getAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getAnalytics };