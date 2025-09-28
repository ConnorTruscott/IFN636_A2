class ComplaintBase {
    constructor(complaint) {
        this.complaint = complaint;
    }

    getDetails() {
        return{
            ...this.complaint,
            features: []
        };
    }
}

class ComplaintDecorator {
    constructor(complaintObj){
        this.complaintObj=complaintObj;
    }

    getDetails() {
        return this.complaintObj.getDetails();
    }
}

class PriorityDecorator extends ComplaintDecorator {
    constructor(complaintObj, level='Normal'){
        super(complaintObj);
        this.level=level;
    }

    getDetails(){
        const details = super.getDetails();
        return{
            ...details,
            priority: this.level,
            features: [...details.features, 'priority'],
        };
    }
}

class AnonymousDecorator extends ComplaintDecorator {
    constructor(complaintObj){
        super(complaintObj);
    }

    getDetails(){
        const details = super.getDetails();
        return {
            ...details,
            displayUser: 'Anonymous',
            features: [...details.features, 'anonymous',]
        };
    }
}

module.exports = {ComplaintBase, ComplaintDecorator, PriorityDecorator, AnonymousDecorator};