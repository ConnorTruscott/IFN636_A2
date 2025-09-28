// BaseService
class BaseService {
  constructor(ComplaintModel) {
    this.Complaint = ComplaintModel;
  }
}

// ComplaintCountService 
class ComplaintCountService extends BaseService {
  async getCounts() {
    return {
      total: await this.Complaint.countDocuments(),
      received: await this.Complaint.countDocuments({ status: "received" }),
      resolving: await this.Complaint.countDocuments({ status: "resolving" }),
      closed: await this.Complaint.countDocuments({ status: "closed" }),
    };
  }
}

// TrendService
class TrendService extends BaseService {
  async getTrend() {
    const complaints = await this.Complaint.find().sort({ createdAt: 1 });
    if (complaints.length === 0) return [];

    const countsByDay = {};
    for (const c of complaints) {
      if (!c.createdAt) continue;
      const d = new Date(c.createdAt);
      if (isNaN(d)) continue; 

      const day = d.toISOString().split("T")[0];
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    }

    const days = Object.keys(countsByDay).sort();
    const start = new Date(days[0]);
    const end = new Date(days[days.length - 1]);

    const trend = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      trend.push({ date: key, total: countsByDay[key] || 0 });
    }
    return trend;
  }
}


// CategoryService 
class CategoryService extends BaseService {
  async getCategoryBreakdown() {
    const complaints = await this.Complaint.find();
    const breakdown = {};

    for (const c of complaints) {
      const cat = c.category || "Uncategorized";
      if (!breakdown[cat]) {
        breakdown[cat] = { received: 0, resolving: 0, closed: 0 };
      }
      if (c.status && breakdown[cat][c.status] !== undefined) {
        breakdown[cat][c.status]++;
      }
    }
    return breakdown;
  }
}

// RatingService 
class RatingService extends BaseService {
  async getRatingStats() {
    const complaints = await this.Complaint.find({ status: "closed" });
    const ratings = complaints
      .map(c => c.feedback?.rating)
      .filter(r => r !== undefined);

    if (ratings.length === 0) {
      return { avgRating: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const r of ratings) {
      if (distribution[r] !== undefined) distribution[r]++;
    }

    return { avgRating: avg, distribution };
  }
}

// AnalyticsFacade 
class AnalyticsFacade {
  constructor(ComplaintModel) {
    this.countService = new ComplaintCountService(ComplaintModel);
    this.ratingService = new RatingService(ComplaintModel);
    this.categoryService = new CategoryService(ComplaintModel);
    this.trendService = new TrendService(ComplaintModel);
  }

  async getAnalytics() {
    const counts = await this.countService.getCounts();
     const { avgRating, distribution } = await this.ratingService.getRatingStats();
     const categoryBreakdown = await this.categoryService.getCategoryBreakdown();
     const trend = await this.trendService.getTrend();

    return {
      ...counts,
      avgRating: Number(avgRating),
      ratingDistribution: distribution,
      categoryBreakdown,
      trend,
    };
  }
}

module.exports = AnalyticsFacade;