const Notification = require('../models/Notification');
const User = require('../models/User');

class AdminObserver{
    async update(notification){
        console.log("Admin notified:", notification);
        // TODO: save to db
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

    update(notification){
        if (notification.recipient === this.userId){
            console.log(`User${this.userId} notified:`, notification);
            //TODO: save to db
        }
    }
}

class StaffObserver{
    constructor(staffId) {
        this.staffId = staffId;
    }

    update(notification) {
        if (notification.recipient === this.staffId){
            console.log(`Staff ${this.staffId} notified:`, notification);
            //TODO: save to db
        }
    }
}

module.exports = {AdminObserver, UserObserver, StaffObserver};