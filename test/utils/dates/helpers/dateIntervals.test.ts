import { endOfDay, format, formatISO, startOfDay, subDays } from 'date-fns';
import { afterEach, beforeEach, vi } from 'vitest';
import { now, parseDate } from '../../../../src/utils/dates/helpers/date';
import {
  calcPrevDateRange,
  dateRangeDaysDiff,
  dateRangeIsEmpty,
  dateToMatchingInterval,
  intervalToDateRange,
  isMandatoryStartDateRange,
  rangeIsInterval,
  rangeOrIntervalToString,
  toDateRange,
  type DateInterval,
} from '../../../../src/utils/dates/helpers/dateIntervals';

describe('date-types', () => {
  const currentDate = now();
  const daysBack = (days: number) => subDays(currentDate, days);

  describe('dateRangeIsEmpty', () => {
    it.each([
      [undefined, true],
      [{}, true],
      [{ startDate: null }, true],
      [{ endDate: null }, true],
      [{ startDate: null, endDate: null }, true],
      [{ startDate: undefined }, true],
      [{ endDate: undefined }, true],
      [{ startDate: undefined, endDate: undefined }, true],
      [{ startDate: undefined, endDate: null }, true],
      [{ startDate: null, endDate: undefined }, true],
      [{ startDate: currentDate }, false],
      [{ endDate: currentDate }, false],
      [{ startDate: currentDate, endDate: currentDate }, false],
    ])('returns proper result', (dateRange, expectedResult) => {
      expect(dateRangeIsEmpty(dateRange)).toEqual(expectedResult);
    });
  });

  describe('rangeIsInterval', () => {
    it.each([
      [undefined, false],
      [{}, false],
      ['today' as DateInterval, true],
      ['yesterday' as DateInterval, true],
    ])('returns proper result', (range, expectedResult) => {
      expect(rangeIsInterval(range)).toEqual(expectedResult);
    });
  });

  describe('rangeOrIntervalToString', () => {
    it.each([
      [undefined, undefined],
      ['today' as DateInterval, 'Today'],
      ['yesterday' as DateInterval, 'Yesterday'],
      ['last7Days' as DateInterval, 'Last 7 days'],
      ['last30Days' as DateInterval, 'Last 30 days'],
      ['last90Days' as DateInterval, 'Last 90 days'],
      ['last180Days' as DateInterval, 'Last 180 days'],
      ['last365Days' as DateInterval, 'Last 365 days'],
      [{}, undefined],
      [{ startDate: null }, undefined],
      [{ endDate: null }, undefined],
      [{ startDate: null, endDate: null }, undefined],
      [{ startDate: undefined }, undefined],
      [{ endDate: undefined }, undefined],
      [{ startDate: undefined, endDate: undefined }, undefined],
      [{ startDate: undefined, endDate: null }, undefined],
      [{ startDate: null, endDate: undefined }, undefined],
      [{ startDate: parseDate('2020-01-01', 'yyyy-MM-dd') }, 'Since 2020-01-01'],
      [{ endDate: parseDate('2020-01-01', 'yyyy-MM-dd') }, 'Until 2020-01-01'],
      [
        { startDate: parseDate('2020-01-01', 'yyyy-MM-dd'), endDate: parseDate('2021-02-02', 'yyyy-MM-dd') },
        '2020-01-01 - 2021-02-02',
      ],
    ])('returns proper result', (range, expectedValue) => {
      expect(rangeOrIntervalToString(range)).toEqual(expectedValue);
    });
  });

  describe('intervalToDateRange', () => {
    const formatted = (date?: Date | null): string | undefined => (!date ? undefined : format(date, 'yyyy-MM-dd'));

    it.each([
      [undefined, undefined, undefined],
      ['today' as const, currentDate, currentDate],
      ['yesterday' as const, daysBack(1), daysBack(1)],
      ['last7Days' as const, daysBack(7), currentDate],
      ['last30Days' as const, daysBack(30), currentDate],
      ['last90Days' as const, daysBack(90), currentDate],
      ['last180Days' as const, daysBack(180), currentDate],
      ['last365Days' as const, daysBack(365), currentDate],
    ])('returns proper result', (interval, expectedStartDate, expectedEndDate) => {
      const { startDate, endDate } = intervalToDateRange(interval);

      expect(formatted(expectedStartDate)).toEqual(formatted(startDate));
      expect(formatted(expectedEndDate)).toEqual(formatted(endDate));
    });
  });

  describe('dateToMatchingInterval', () => {
    it.each([
      [startOfDay(currentDate), 'today'],
      [currentDate, 'today'],
      [formatISO(currentDate), 'today'],
      [daysBack(1), 'yesterday'],
      [endOfDay(daysBack(1)), 'yesterday'],
      [daysBack(2), 'last7Days'],
      [daysBack(7), 'last7Days'],
      [startOfDay(daysBack(7)), 'last7Days'],
      [daysBack(18), 'last30Days'],
      [daysBack(29), 'last30Days'],
      [daysBack(58), 'last90Days'],
      [startOfDay(daysBack(90)), 'last90Days'],
      [daysBack(120), 'last180Days'],
      [daysBack(250), 'last365Days'],
      [daysBack(366), 'all'],
      [formatISO(daysBack(500)), 'all'],
    ])('returns the first interval which contains provided date', (date, expectedInterval) => {
      expect(dateToMatchingInterval(date)).toEqual(expectedInterval);
    });
  });

  describe('toDateRange', () => {
    it.each([
      ['today' as const, intervalToDateRange('today')],
      ['yesterday' as const, intervalToDateRange('yesterday')],
      ['last7Days' as const, intervalToDateRange('last7Days')],
      ['last30Days' as const, intervalToDateRange('last30Days')],
      ['last90Days' as const, intervalToDateRange('last90Days')],
      ['last180Days' as const, intervalToDateRange('last180Days')],
      ['last365Days' as const, intervalToDateRange('last365Days')],
      ['all' as const, intervalToDateRange('all')],
      [{}, {}],
      [{ startDate: currentDate }, { startDate: currentDate }],
      [{ endDate: currentDate }, { endDate: currentDate }],
      [
        { startDate: daysBack(10), endDate: currentDate },
        { startDate: daysBack(10), endDate: currentDate },
      ],
    ])('returns properly parsed interval or range', (rangeOrInterval, expectedResult) => {
      expect(toDateRange(rangeOrInterval)).toEqual(expectedResult);
    });
  });

  describe('isMandatoryStartDateRange', () => {
    it.each([
      [undefined, false],
      [{}, false],
      [{ startDate: null }, false],
      [{ endDate: null }, false],
      [{ startDate: null, endDate: null }, false],
      [{ startDate: new Date() }, true],
      [{ endDate: new Date() }, false],
      [{ startDate: new Date(), endDate: null }, true],
      [{ startDate: null, endDate: new Date() }, false],
      [{ startDate: new Date(), endDate: new Date() }, true],
    ])('returns true for semi-strict date ranges', (dateRange, isStrict) => {
      expect(isMandatoryStartDateRange(dateRange)).toEqual(isStrict);
    });
  });

  describe('calcPrevDateRange', () => {
    it.each([
      [
        { startDate: new Date('2024-01-10 00:00:00'), endDate: new Date('2024-01-18 23:59:59') },
        '2024-01-01 00:00:00',
        '2024-01-09 23:59:59',
      ],
      [
        { startDate: new Date('2024-01-18'), endDate: new Date('2024-01-18') },
        '2024-01-17 00:00:00',
        '2024-01-17 23:59:59',
      ],
      [
        { startDate: new Date('2024-02-27 23:00:00'), endDate: new Date('2024-05-02 01:00:00') },
        '2023-12-23 00:00:00',
        '2024-02-26 23:59:59',
      ],
      [
        { startDate: subDays(currentDate, 3) },
        `${format(subDays(currentDate, 7), 'yyyy-MM-dd')} 00:00:00`,
        `${format(subDays(currentDate, 4), 'yyyy-MM-dd')} 23:59:59`,
      ],
    ])('calculates previous date range', (dateRange, expectedStartDate, expectedEndDate) => {
      const { startDate, endDate } = calcPrevDateRange(dateRange);

      expect(format(startDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(expectedStartDate);
      expect(format(endDate, 'yyyy-MM-dd HH:mm:ss')).toEqual(expectedEndDate);
    });
  });

  describe('dateRangeDaysDiff', () => {
    it.each([
      [{ startDate: new Date('2024-01-10 00:00:00'), endDate: new Date('2024-01-18 23:59:59') }, 8],
      [{ startDate: new Date('2024-02-27 23:00:00'), endDate: new Date('2024-05-02 01:00:00') }, 64],
      [{ startDate: subDays(currentDate, 5) }, 5],
      [undefined, undefined],
      [{}, undefined],
      [{ endDate: new Date() }, undefined],
    ])('returns the difference in days for a dateRange', (dateRange, expectedDays) => {
      expect(dateRangeDaysDiff(dateRange)).toEqual(expectedDays);
    });
  });

  describe('REQ-5 local calendar day helpers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-03-10T18:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('derives preset boundaries with date-fns startOfDay and endOfDay', () => {
      const frozenNow = now();

      expect(intervalToDateRange('today')).toEqual({
        startDate: startOfDay(frozenNow),
        endDate: endOfDay(frozenNow),
      });
      expect(intervalToDateRange('last365Days')).toEqual({
        startDate: startOfDay(subDays(frozenNow, 365)),
        endDate: endOfDay(frozenNow),
      });
    });
  });

  describe('REQ-6 UTC runtime preset intervals', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-14T15:30:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('matches startOfDay and endOfDay for today', () => {
      const frozenNow = now();
      const { startDate, endDate } = intervalToDateRange('today');

      expect(startDate).toEqual(startOfDay(frozenNow));
      expect(endDate).toEqual(endOfDay(frozenNow));
    });

    it('matches local calendar boundaries for yesterday and last 7 days', () => {
      const frozenNow = now();

      expect(intervalToDateRange('yesterday')).toEqual({
        startDate: startOfDay(subDays(frozenNow, 1)),
        endDate: endOfDay(subDays(frozenNow, 1)),
      });
      expect(intervalToDateRange('last7Days')).toEqual({
        startDate: startOfDay(subDays(frozenNow, 7)),
        endDate: endOfDay(frozenNow),
      });
    });

    it('classifies timestamps with dateToMatchingInterval using the same boundaries', () => {
      const frozenNow = now();

      expect(dateToMatchingInterval(frozenNow)).toEqual('today');
      expect(dateToMatchingInterval(startOfDay(subDays(frozenNow, 1)))).toEqual('yesterday');
      expect(dateToMatchingInterval(startOfDay(subDays(frozenNow, 7)))).toEqual('last7Days');
      expect(dateToMatchingInterval(subDays(frozenNow, 400))).toEqual('all');
    });
  });

  describe('REQ-7 timezone regression reference bounds', () => {
    const DAY_MS = 24 * 60 * 60 * 1000;

    const legacyUtcDayStart = (date: Date): Date =>
      new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

    const legacyUtcDayEnd = (date: Date): Date => new Date(legacyUtcDayStart(date).getTime() + DAY_MS - 1);

    type LocalDayBounds = { start: Date; end: Date };

    const assertLegacyDiffersFromLocal = (frozenNow: Date, localBounds: LocalDayBounds) => {
      expect(legacyUtcDayStart(frozenNow).toISOString()).not.toEqual(localBounds.start.toISOString());
      expect(legacyUtcDayEnd(frozenNow).toISOString()).not.toEqual(localBounds.end.toISOString());
    };

    it('America/Los_Angeles — June 14 2024 10:00 local today/yesterday/last 7 days', () => {
      const frozenNow = new Date('2024-06-14T17:00:00.000Z');
      const today: LocalDayBounds = {
        start: new Date('2024-06-14T07:00:00.000Z'),
        end: new Date('2024-06-15T06:59:59.999Z'),
      };
      const yesterday: LocalDayBounds = {
        start: new Date('2024-06-13T07:00:00.000Z'),
        end: new Date('2024-06-14T06:59:59.999Z'),
      };
      const last7Days: LocalDayBounds = {
        start: new Date('2024-06-07T07:00:00.000Z'),
        end: today.end,
      };

      assertLegacyDiffersFromLocal(frozenNow, today);

      expect(yesterday.end.getTime()).toBe(today.start.getTime() - 1);
      expect(last7Days.start.toISOString()).toEqual('2024-06-07T07:00:00.000Z');
    });

    it('America/Los_Angeles — DST spring-forward day (March 10 2024)', () => {
      const frozenNow = new Date('2024-03-10T18:00:00.000Z');
      const today: LocalDayBounds = {
        start: new Date('2024-03-10T08:00:00.000Z'),
        end: new Date('2024-03-11T06:59:59.999Z'),
      };

      assertLegacyDiffersFromLocal(frozenNow, today);
    });

    it('Pacific/Auckland — June 14 2024 10:00 local today/yesterday/last 7 days', () => {
      const frozenNow = new Date('2024-06-13T22:00:00.000Z');
      const today: LocalDayBounds = {
        start: new Date('2024-06-13T12:00:00.000Z'),
        end: new Date('2024-06-14T11:59:59.999Z'),
      };
      const yesterday: LocalDayBounds = {
        start: new Date('2024-06-12T12:00:00.000Z'),
        end: new Date('2024-06-13T11:59:59.999Z'),
      };
      const last7Days: LocalDayBounds = {
        start: new Date('2024-06-06T12:00:00.000Z'),
        end: today.end,
      };

      assertLegacyDiffersFromLocal(frozenNow, today);
      expect(yesterday.end.getTime()).toBe(today.start.getTime() - 1);
      expect(last7Days.start.toISOString()).toEqual('2024-06-06T12:00:00.000Z');
    });

    it('classifies a visit at the documented LA local-day start as today when the clock is frozen', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));

      const laLocalTodayStart = new Date('2024-06-14T07:00:00.000Z');
      expect(dateToMatchingInterval(new Date(laLocalTodayStart.getTime() + 60_000))).toEqual('today');

      vi.useRealTimers();
    });
  });
});
