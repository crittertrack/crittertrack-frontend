import { calculateAgeDetailed } from './dateFormatter';

describe('dateFormatter age calculations', () => {
  it('includes days when the age is over a year', () => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return new RealDate('2026-09-16T00:00:00Z');
        }
        return new RealDate(...args);
      }

      static now() {
        return new RealDate('2026-09-16T00:00:00Z').getTime();
      }
    };

    try {
      expect(calculateAgeDetailed('2025-08-18')).toBe('1y 0m 29d');
    } finally {
      global.Date = RealDate;
    }
  });
});
