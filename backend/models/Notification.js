const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    type: {type: String, required: true},
    message: {type: String, required: true},
    read: {type: Boolean, default: false},
    timestamp: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Notification', notificationSchema);