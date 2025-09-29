const {ReceivedState, ResolvingState, ClosedState} = require('./complaintStates');

class ComplaintWrapper {
    constructor(complaint) {
        this.complaint = complaint;
        this.state = this.initState(complaint.status);
    }

    initState(status) {
        switch (status) {
            case 'received': return new ReceivedState(this.complaint, this);
            case 'resolving': return new ResolvingState(this.complaint, this);
            case 'closed': return new ClosedState(this.complaint, this);
            default: return new ReceivedState(this.complaint, this);
        }
    }

    async setState(state) {
        this.state = state;
        await this.state.enter();
    }

    async updateStatus(newStatus) {
        await this.state.updateStatus(newStatus);
    }
}

module.exports = ComplaintWrapper;