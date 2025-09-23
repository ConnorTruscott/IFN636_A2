const mongoose = require('mongoose');

const staffCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('StaffCategory', staffCategorySchema);