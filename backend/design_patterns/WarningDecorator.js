// Decorator Base Class
class AnalyticsDecorator {
  constructor(component) {
    this.component = component;
  }

  async getAnalytics() {
    return await this.component.getAnalytics();
  }
}

// System info message
class SystemInfoWarning extends AnalyticsDecorator {
  async getAnalytics() {
    const data = await super.getAnalytics();
    data.warnings = data.warnings || [];

    data.warnings.push({
      level: "info",
      message: "Analytics are based on the latest available data and update automatically when new complaints are submitted."
    });

    return data;
  }
}


// Concrete Class
// High "receive" status 
class ComplaintVolumeWarning extends AnalyticsDecorator {
  constructor(component, threshold = 10) {
    super(component);
    this.threshold = threshold;
  }

  async getAnalytics() {
    const data = await super.getAnalytics();
    data.warnings = data.warnings || []; 

    if (data.received >= this.threshold) {
      data.warnings.push({
        level: "critical",
        message: "`Overall complaints are unusually high. Please ensure staff are responding promptly.`"
      });
    }

    return data;
  }
}

// Highest received status of the category
class CategoryVolumeWarning extends AnalyticsDecorator {
  async getAnalytics() {
    const data = await super.getAnalytics();
    data.warnings = data.warnings || [];

    if (data.categoryBreakdown) {
      let maxCategory = null;
      let maxReceived = -1;

      for (const [cat, values] of Object.entries(data.categoryBreakdown)) {
        if (values.received > maxReceived) {
          maxCategory = cat;
          maxReceived = values.received;
        }
      }

      if (maxCategory) {
        data.warnings.push({
          level: "critical",
          message: `Most complaints are concentrated in the "${maxCategory}" category. Please prioritize handling these issues promptly.`
        });
      }
    }

    return data;
  }
}

// Low rating 
class RatingWarning extends AnalyticsDecorator {
  constructor(component, threshold = 3) {
    super(component);
    this.threshold = threshold;
  }

  async getAnalytics() {
    const data = await super.getAnalytics();
    data.warnings = data.warnings || [];

    if (data.avgRating <= this.threshold) {
      data.warnings.push({
        level: "warning",
        message: "Low student satisfaction detected. Please check feedback for details."
      });
    }

    return data;
  }
}

// Complaint rising trend  
class TrendWarning extends AnalyticsDecorator {
  constructor(component, days = 3) {
    super(component);
    this.days = days;
  }

  async getAnalytics() {
    const data = await super.getAnalytics();
    data.warnings = data.warnings || [];

    if (data.trend && data.trend.length >= this.days) {
      const lastDays = data.trend.slice(-this.days).map(d => d.total);
    
      const rising = lastDays.every((v, i, arr) => i === 0 || v >= arr[i - 1]);

      if (rising) {
        data.warnings.push({
          level: "warning",
          message: `Complaints have been rising continuously for the past ${this.days} days.`
        });
      }
    }

    return data;
  }
}

module.exports = { SystemInfoWarning, ComplaintVolumeWarning, CategoryVolumeWarning, RatingWarning, TrendWarning };