class NotificationService {
    constructor(){
        this.observers = [];
        this.notifications = [];
    }

    subscribe(observer){
        this.observers.push(observer);
    }

    unsubscribe(observer){
        this.observers = this.observers.filter(o => 0 !== observer);
    }

    notify(notification) {
        this.notifications.push(notification);
        this.observers.forEach(observer => observer.update(notification));
    }

    complaintCreated(user, userName, complaintId){
        this.notify({
            type: "COMPLAINT_CREATED",
            message: `A new complaint has been created by ${userName}.`,
            recipiant: "Admin",
            timestamp: new Date()
        });
    }

    complaintResolved(user, complaintId){
        this.notify({
            type: "COMPLAINT_RESOLVED",
            message: `Your complaint ${complaintId} has been resolved.`,
            recipiant: user,
            timestamp: new Date()
        });
    }

    feedbackSubmitted(staff, feedbackId){
        this.notify({
            type: "FEEDBACK_SUBMITTED",
            message: `New feedback received (ID: ${feedbackId}).`,
            recipiant: staff,
            timestamp: new Date()
        });
    }

    userRegistered(user){
        this.notify({
            type: "USER_REGISTERED",
            message: `New ${user.role} registered: ${user.name} (${user.email}).`,
            recipiant: "Admin",
            timestamp: new Date()
        });
    }
}

const notificationService = new NotificationService();
module.exports = notificationService;