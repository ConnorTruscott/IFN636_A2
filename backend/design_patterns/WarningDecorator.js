const AnalyticsComponent = require('./AnalyticsFacade'); 

// Decorator Base Class
class AnalyticsDecorator {
  constructor(component) {
    this.component = component;
  }

  async getAnalytics() {
    return await this.component.getAnalytics();
  }
}

// Concrete Decorator-- Warning
class WarningDecorator extends AnalyticsDecorator {
  async getAnalytics() {
    const data = await super.getAnalytics();

    const warnings = [];
    if (data.received >= 10) {
      warnings.push("High number of complaints received. Please remind staff to handle them promptly.");
    }
    if (data.avgRating < 3) {
      warnings.push("Low student satisfaction detected. Please check feedback for details.");
    }

    return { ...data, warnings };
  }
}

module.exports = WarningDecorator;