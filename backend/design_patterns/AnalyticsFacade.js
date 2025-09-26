// ComplaintCountService 
class ComplaintCountService {
  constructor(ComplaintModel) {
    this.Complaint = ComplaintModel;
  }

  async getCounts() {
    const total = await this.Complaint.countDocuments();
    const pending = await this.Complaint.countDocuments({ status: "received" });
    const resolving = await this.Complaint.countDocuments({ status: "resolving" });
    const closed = await this.Complaint.countDocuments({ status: "closed" });

    return { total, pending, resolving, closed };
  }
}

// ResolutionTimeService
class ResolutionTimeService {
  constructor(ComplaintModel) {
    this.Complaint = ComplaintModel;
  }

  async getAvgResolutionTime() {
    const complaints = await this.Complaint.find({ status: "closed" });

    const resolutionTimes = complaints
      .map(c => {
        if (c.statusTimestamps?.received && c.statusTimestamps?.closed) {
          const start = new Date(c.statusTimestamps.received);
          const end = new Date(c.statusTimestamps.closed);
          return (end - start) / (1000 * 60 * 60); // hours
        }
        return null;
      })
      .filter(Boolean);

    return resolutionTimes.length
      ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
      : 0;
  }
}

// RatingService 
class RatingService {
  constructor(ComplaintModel) {
    this.Complaint = ComplaintModel;
  }

  async getAvgRating() {
    const complaints = await this.Complaint.find({ status: "closed" });

    const ratings = complaints
      .map(c => c.feedback?.rating)
      .filter(r => r !== undefined);

    return ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
  }
}

// AnalyticsFacade 
class AnalyticsFacade {
  constructor(ComplaintModel) {
    this.countService = new ComplaintCountService(ComplaintModel);
    this.resolutionService = new ResolutionTimeService(ComplaintModel);
    this.ratingService = new RatingService(ComplaintModel);
  }

  async getAnalytics() {
    const counts = await this.countService.getCounts();
    const avgResolutionTime = await this.resolutionService.getAvgResolutionTime();
    const avgRating = await this.ratingService.getAvgRating();

    return {
      ...counts,
      avgResolutionTime: Number(avgResolutionTime),
      avgRating: Number(avgRating),
    };
  }
}

module.exports = AnalyticsFacade;