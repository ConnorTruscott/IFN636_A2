const Notification = require('../models/Notification');
const User = require('../models/User');

class AdminObserver{
    async update(notification){
        console.log("Admin notified:", notification);
        const admin = await User.findOne({role: 'Admin'});
        if (!admin) return;

        await Notification.create({
            recipientId: admin._id,
            type: notification.type,
            message: notification.message,
            timestamp: notification.timestamp,
        });
    }
}

class UserObserver {
    constructor(userId) {
        this.userId = userId;
    }

    async update(notification){
        if (notification.recipient !== this.userId) return;
        console.log(`User ${this.userId} notified:`, notification);
        await Notification.create({
            recipientId: this.userId,
            type: notification.type,
            message: notification.message,
            timestamp: notification.timestamp,
        });
    }
}

class StaffObserver{
    constructor(staffId) {
        this.staffId = staffId;
    }

    async update(notification){
        if (notification.recipient !== this.staffId) return;
        console.log (`Staff ${this.staffId} notified:`, notification);
        await Notification.create({
            recipientId: this.staffId,
            type: notification.type,
            message: notification.message,
            timestamp: notification.timestamp,
        });
    }
}

module.exports = {AdminObserver, UserObserver, StaffObserver};