const Complaint = require('../models/Complaint');
const AnalyticsFacade = require('../design_patterns/AnalyticsFacade');
const { SystemInfoWarning, ComplaintVolumeWarning, CategoryVolumeWarning, RatingWarning, TrendWarning } = require('../design_patterns/WarningDecorator');

const getAnalytics = async (req, res) => {
  try {
    let component = new AnalyticsFacade(Complaint);
    component = new ComplaintVolumeWarning(component);
    component = new CategoryVolumeWarning(component); 
    component = new RatingWarning(component);
    component = new TrendWarning(component);
    component = new SystemInfoWarning(component); 
    

    const result = await component.getAnalytics();
    res.json(result);
  } catch (err) {
    console.error("getAnalytics error:", err); 
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAnalytics };