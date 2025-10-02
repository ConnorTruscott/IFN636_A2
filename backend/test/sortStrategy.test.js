const chai = require('chai');
const { expect } = chai;

// Import everything from the strategy file
const {
  makeStrategy,
  DateSort,
  TitleSort,
  CategorySort,
  LocationSort,
  StudentSort,
  StaffSort,
  StatusSort,
} = require('../design_patterns/sortStrategy');

describe('Sort Strategy Pattern', () => {

  // A consistent set of unsorted data to test against
  const mockComplaints = [
    { title: 'Zebra Printer Jam', category: 'IT', date: '2025-10-03', status: 'resolving' },
    { title: 'Apple in Vending Machine', category: 'Facilities', date: '2025-10-01', status: 'closed' },
    { title: 'Classroom Projector Broken', category: 'Academics', date: '2025-10-02', status: 'received' },
  ];

  // --- Test the Factory Function ---
  describe('makeStrategy Factory', () => {
    it('should return a TitleSort instance for "title"', () => {
      expect(makeStrategy('title')).to.be.an.instanceOf(TitleSort);
    });
    it('should return a CategorySort instance for "category"', () => {
      expect(makeStrategy('category')).to.be.an.instanceOf(CategorySort);
    });
    it('should return a StatusSort instance for "status"', () => {
        expect(makeStrategy('status')).to.be.an.instanceOf(StatusSort);
      });
    it('should return a DateSort instance for "date"', () => {
      expect(makeStrategy('date')).to.be.an.instanceOf(DateSort);
    });
    it('should return a DateSort instance for a default/unknown key', () => {
      expect(makeStrategy('some_other_key')).to.be.an.instanceOf(DateSort);
    });
  });

  // --- Test the Concrete Strategies ---
  describe('Sorting Execution', () => {
    it('should sort correctly by Title (ascending)', () => {
      const strategy = new TitleSort();
      const sorted = strategy.execute(mockComplaints, 'asc');
      // Extract just the titles to easily check the order
      const titles = sorted.map(c => c.title);
      expect(titles).to.deep.equal([
        'Apple in Vending Machine',
        'Classroom Projector Broken',
        'Zebra Printer Jam',
      ]);
    });

    it('should sort correctly by Title (descending)', () => {
        const strategy = new TitleSort();
        const sorted = strategy.execute(mockComplaints, 'desc');
        const titles = sorted.map(c => c.title);
        expect(titles).to.deep.equal([
          'Zebra Printer Jam',
          'Classroom Projector Broken',
          'Apple in Vending Machine',
        ]);
      });

    it('should sort correctly by Date (ascending)', () => {
      const strategy = new DateSort();
      const sorted = strategy.execute(mockComplaints, 'asc');
      const dates = sorted.map(c => c.date);
      expect(dates).to.deep.equal(['2025-10-01', '2025-10-02', '2025-10-03']);
    });

    it('should sort correctly by Category (ascending)', () => {
        const strategy = new CategorySort();
        const sorted = strategy.execute(mockComplaints, 'asc');
        const categories = sorted.map(c => c.category);
        expect(categories).to.deep.equal(['Academics', 'Facilities', 'IT']);
    });

    it('should sort correctly by Status (ascending)', () => {
        const strategy = new StatusSort();
        const sorted = strategy.execute(mockComplaints, 'asc');
        const statuses = sorted.map(c => c.status);
        expect(statuses).to.deep.equal(['closed', 'received', 'resolving']);
    });

    it('should handle non-array input gracefully', () => {
        const strategy = new TitleSort();
        const result = strategy.execute(null, 'asc');
        expect(result).to.be.an('array').that.is.empty;
    });
  });
});