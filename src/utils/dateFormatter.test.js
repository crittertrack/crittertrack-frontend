import { calculateAgeDetailed, formatAnimalAge } from './dateFormatter';

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

  it('includes days when the age is under a year', () => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return new RealDate('2026-06-15T00:00:00Z');
        }
        return new RealDate(...args);
      }

      static now() {
        return new RealDate('2026-06-15T00:00:00Z').getTime();
      }
    };

    try {
      expect(formatAnimalAge('2026-05-10')).toEqual({ years: 0, months: 1, days: 5, label: '1m 5d' });
    } finally {
      global.Date = RealDate;
    }
  });
});
