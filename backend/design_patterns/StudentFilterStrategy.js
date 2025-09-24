const mongoose = require("mongoose");

// Strategy Interface
class FilterStrategy {
  async applyFilter(req, ComplaintModel) {
    throw new Error("applyFilter must be implemented");
  }
}

// Concrete Strategy: Sorting by date for Student
class StudentFilterStrategy extends FilterStrategy {
  async applyFilter(req, ComplaintModel, order) {
    try {
      const result = await ComplaintModel.find({
        userId: new mongoose.Types.ObjectId(req.user.id), 
        date: { $ne: null }
      }).sort({ date: order });

      return result;
    } catch (err) {
      console.error("Mongoose query error:", err);
      throw err;
    }
  }
}

module.exports = { FilterStrategy, StudentFilterStrategy };