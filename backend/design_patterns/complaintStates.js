// const notificationService = require('../design_patterns/NotificationService');
// const {UserObserver} = require('../design_patterns/NotificationObservers');

// class ComplaintState {
//     constructor(complaint) {
//         this.wrapper = this.wrapper;
//         this.complaint = this.wrapper.complaint;
//     }
//     async enter() {}
//     async updateStatus(newStatus) {
//         throw new Error(`Cannot update from ${this.complaint.status} to ${newStatus}`);
//     }
// }

// class ReceivedState extends ComplaintState {
//     async enter () {
//         this.complaint.statusTimestamps.received = new Date();
//         this.complaint = 'received';
//     }
//     async updateStatus(newStatus) {
//         if (newStatus==='resolving'){
//             this.complaint.setState(new ResolvingState(this.wrapper));
//         } else if (newStatus === 'closed') {
//             this.complaint.setState(new ClosedState(this.wrapper));
//         } else {
//             throw new Error('Invalid state change');
//         }
//     }
// }

// class ResolvingState extends ComplaintState {
//     async enter () {
//         this.complaint.statusTimestamps.resolving = new Date();
//         this.complaint.status = 'resolving'

//         const studentObserver = new UserObserver(this.complaint.userId);
//         notificationService.subscribe(studentObserver);
//         await notificationService.complaintStatusUpdated(this.complaint.userId, this.complaint._id, 'resolving');
//         notificationService.unsubscribe(studentObserver);
//     }
//     async updateStatus(newStatus){
//         if (newStatus === 'closed') {
//             this.complaint.setState(new ClosedState(this.wrapper));
//         } else {
//             throw new Error('Invalid state change');
//         }
//     }
// }

// class ClosedState extends ComplaintState {
//     async enter () {
//         this.complaint.statusTimestamps.closed = new Date();
//         this.complaint.completed=true;
//         this.complaint.status='closed';

//         const studentObserver = new UserObserver(this.complaint.userId);
//         notificationService.subscribe(studentObserver)
//         await notificationService.complaintStatusUpdated(this.complaint.userId, this.complaint._id, 'closed');
//         notificationService.unsubscribe(studentObserver);
//     }
//     async updateStatus() {
//         throw new Error('Cannot update a closed complaint');
//     }
// }

// module.exports = {ReceivedState, ResolvingState, ClosedState, ComplaintState};

const notificationService = require('../design_patterns/NotificationService');
const {UserObserver} = require('../design_patterns/NotificationObservers');

class ComplaintState {
    constructor(complaint, wrapper) {
        this.complaint = complaint;
        this.wrapper = wrapper;
    }
    async enter() {}
    async updateStatus(newStatus) {
        throw new Error(`Cannot update from ${this.complaint.status} to ${newStatus}`);
    }
}

class ReceivedState extends ComplaintState {
    async enter () {
        this.complaint.status = 'received';
        this.complaint.statusTimestamps.received = new Date();
    }
    async updateStatus(newStatus) {
        if (newStatus==='resolving'){
            await this.wrapper.setState(new ResolvingState(this.complaint, this.wrapper));
        } else if (newStatus === 'closed') {
            await this.wrapper.setState(new ClosedState(this.complaint, this.wrapper));
        } else {
            throw new Error('Invalid state change');
        }
    }
}

class ResolvingState extends ComplaintState {
    async enter () {
        this.complaint.status = 'resolving';
        this.complaint.statusTimestamps.resolving = new Date();
        const studentObserver = new UserObserver(this.complaint.userId);
        notificationService.subscribe(studentObserver);
        await notificationService.complaintStatusUpdated(this.complaint.userId, this.complaint._id, 'resolving');
        notificationService.unsubscribe(studentObserver);
    }
    async updateStatus(newStatus){
        if (newStatus === 'closed') {
            await this.wrapper.setState(new ClosedState(this.complaint, this.wrapper));
        } else {
            throw new Error('Invalid state change');
        }
    }
}

class ClosedState extends ComplaintState {
    async enter () {
        this.complaint.status = 'closed';
        this.complaint.statusTimestamps.closed = new Date();
        this.complaint.completed=true;
        const studentObserver = new UserObserver(this.complaint.userId);
        notificationService.subscribe(studentObserver)
        await notificationService.complaintStatusUpdated(this.complaint.userId, this.complaint._id, 'closed');
        notificationService.unsubscribe(studentObserver);
    }
    async updateStatus() {
        throw new Error('Cannot update a closed complaint');
    }
}

module.exports = {ReceivedState, ResolvingState, ClosedState, ComplaintState};
