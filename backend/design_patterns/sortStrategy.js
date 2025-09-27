// Interface
class SortStrategy {
  sortSpec() {
    return { date: -1 }; // default newest first
  }
}

// Concrete strategies (aligned to your table columns)
class DateSort extends SortStrategy {
  sortSpec() { return { date: -1, createdAt: -1 }; }
}

class TitleSort extends SortStrategy {
  sortSpec() { return { title: 1, date: -1 }; }
}

class CategorySort extends SortStrategy {
  sortSpec() { return { category: 1, date: -1 }; }
}

class LocationSort extends SortStrategy {
  sortSpec() { return { location: 1, date: -1 }; }
}

class StatusSort extends SortStrategy {
  sortSpec() { return { status: 1, date: -1 }; }
}

// You can extend these later for Student/Assigned Staff
// once those fields are persisted/denormalized for sorting in Mongo.

class SortContext {
  constructor(strategy = new DateSort()) {
    this.strategy = strategy;
  }
  setStrategy(strategy) { this.strategy = strategy; }
  spec() { return this.strategy.sortSpec(); }
}

function makeStrategy(key) {
  switch ((key || '').toLowerCase()) {
    case 'title': return new TitleSort();
    case 'category': return new CategorySort();
    case 'location': return new LocationSort();
    case 'status': return new StatusSort();
    case 'date':
    default: return new DateSort();
  }
}

module.exports = {
  SortContext,
  DateSort,
  TitleSort,
  CategorySort,
  LocationSort,
  StatusSort,
  makeStrategy,
};
