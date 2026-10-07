import { endOfDay, format, formatISO, isWithinInterval, startOfDay, subDays } from 'date-fns';
import { cdp } from 'vitest/browser';
import { now, parseDate } from '../../../../src/utils/dates/helpers/date';
import type { DateInterval } from '../../../../src/utils/dates/helpers/dateIntervals';
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

  type CdpSession = { send: (method: string, params?: object) => Promise<unknown> };

  const setBrowserTimezone = async (timezoneId: string) => {
    const session = cdp() as CdpSession;
    await session.send('Emulation.setTimezoneOverride', { timezoneId });
  };

  const visitIsInRange = (visit: Date, range: ReturnType<typeof intervalToDateRange>) => {
    if (!range.startDate || !range.endDate) {
      return false;
    }

    return isWithinInterval(visit, { start: range.startDate, end: range.endDate });
  };

  describe('local timezone date intervals (REQ-1 through REQ-9)', () => {
    afterEach(async () => {
      await setBrowserTimezone('UTC');
      vi.useRealTimers();
    });

    const withFixedNow = (fixedNow: Date) => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    };

    it('REQ-1: today uses local start and end of the current calendar day', async () => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date('2024-06-14T17:00:00.000Z');
      withFixedNow(fixedNow);

      const { startDate, endDate } = intervalToDateRange('today');

      expect(startDate).toEqual(new Date('2024-06-14T07:00:00.000Z'));
      expect(endDate).toEqual(new Date('2024-06-15T06:59:59.999Z'));
    });

    it('REQ-2: yesterday covers the full previous local calendar day', async () => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date('2024-06-14T17:00:00.000Z');
      withFixedNow(fixedNow);

      const { startDate, endDate } = intervalToDateRange('yesterday');

      expect(startDate).toEqual(new Date('2024-06-13T07:00:00.000Z'));
      expect(endDate).toEqual(new Date('2024-06-14T06:59:59.999Z'));
    });

    it.each([
      ['last7Days' as const, 7],
      ['last30Days' as const, 30],
      ['last90Days' as const, 90],
      ['last180Days' as const, 180],
      ['last365Days' as const, 365],
    ])('REQ-3: %s spans local midnight N days ago through end of today', async (interval, days) => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date('2024-06-14T17:00:00.000Z');
      withFixedNow(fixedNow);

      const { startDate, endDate } = intervalToDateRange(interval);
      const expectedStart = startOfDay(subDays(fixedNow, days));
      const expectedEnd = endOfDay(fixedNow);

      expect(startDate).toEqual(expectedStart);
      expect(endDate).toEqual(expectedEnd);
    });

    it('REQ-4: dateToMatchingInterval uses local day boundaries', async () => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date('2024-06-14T17:00:00.000Z');
      withFixedNow(fixedNow);

      expect(dateToMatchingInterval(new Date('2024-06-14T16:00:00.000Z'))).toEqual('today');
      expect(dateToMatchingInterval(new Date('2024-06-14T03:00:00.000Z'))).toEqual('yesterday');
      expect(dateToMatchingInterval(new Date('2024-06-07T07:00:00.000Z'))).toEqual('last7Days');
      expect(dateToMatchingInterval(new Date('2023-06-14T07:00:00.000Z'))).toEqual('all');
    });

    it('REQ-5: UTC timezone preserves UTC day boundaries for fixed instants', async () => {
      await setBrowserTimezone('UTC');
      const fixedNow = new Date('2024-06-14T10:00:00.000Z');
      withFixedNow(fixedNow);

      const utcDayStart = (date: Date) =>
        new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
      const utcDayEnd = (date: Date) => new Date(utcDayStart(date).getTime() + 24 * 60 * 60 * 1000 - 1);

      expect(intervalToDateRange('today')).toEqual({
        startDate: utcDayStart(fixedNow),
        endDate: utcDayEnd(fixedNow),
      });
      expect(intervalToDateRange('yesterday')).toEqual({
        startDate: utcDayStart(subDays(fixedNow, 1)),
        endDate: utcDayEnd(subDays(fixedNow, 1)),
      });
      expect(dateToMatchingInterval(new Date('2024-06-14T09:00:00.000Z'))).toEqual('today');
      expect(dateToMatchingInterval(new Date('2024-06-13T23:00:00.000Z'))).toEqual('yesterday');
    });

    it.each([
      ['2024-03-10T10:00:00.000Z', 'America/Los_Angeles spring forward'],
      ['2024-11-03T10:00:00.000Z', 'America/Los_Angeles fall back'],
    ])('REQ-6: today aligns to local calendar date on DST transition (%s)', async (fixedNowIso) => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date(fixedNowIso);
      withFixedNow(fixedNow);

      const { startDate, endDate } = intervalToDateRange('today');
      const last7 = intervalToDateRange('last7Days');

      expect(format(startDate!, 'yyyy-MM-dd')).toEqual(format(fixedNow, 'yyyy-MM-dd'));
      expect(format(endDate!, 'yyyy-MM-dd')).toEqual(format(fixedNow, 'yyyy-MM-dd'));
      expect(format(last7.startDate!, 'yyyy-MM-dd')).toEqual(format(subDays(fixedNow, 7), 'yyyy-MM-dd'));
      expect(format(last7.endDate!, 'yyyy-MM-dd')).toEqual(format(fixedNow, 'yyyy-MM-dd'));
    });

    it('REQ-7: Los Angeles today excludes prior evening and includes same-day visits', async () => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date('2024-06-14T17:00:00.000Z');
      withFixedNow(fixedNow);

      const todayRange = intervalToDateRange('today');
      const yesterdayRange = intervalToDateRange('yesterday');

      expect(visitIsInRange(new Date('2024-06-14T16:00:00.000Z'), todayRange)).toBe(true);
      expect(visitIsInRange(new Date('2024-06-14T03:00:00.000Z'), todayRange)).toBe(false);
      expect(visitIsInRange(new Date('2024-06-15T01:00:00.000Z'), todayRange)).toBe(true);
      expect(visitIsInRange(new Date('2024-06-15T01:00:00.000Z'), yesterdayRange)).toBe(false);
    });

    it('REQ-8: Auckland today and yesterday use local midnights', async () => {
      await setBrowserTimezone('Pacific/Auckland');
      const fixedNow = new Date('2024-06-14T20:00:00.000Z');
      withFixedNow(fixedNow);

      const todayRange = intervalToDateRange('today');
      const yesterdayRange = intervalToDateRange('yesterday');

      expect(visitIsInRange(new Date('2024-06-14T12:30:00.000Z'), todayRange)).toBe(true);
      expect(visitIsInRange(new Date('2024-06-14T12:30:00.000Z'), yesterdayRange)).toBe(false);
      expect(visitIsInRange(new Date('2024-06-13T14:00:00.000Z'), yesterdayRange)).toBe(true);
    });

    it('REQ-9: dateToMatchingInterval matches REQ-7 visit examples for preselection', async () => {
      await setBrowserTimezone('America/Los_Angeles');
      const fixedNow = new Date('2024-06-14T17:00:00.000Z');
      withFixedNow(fixedNow);

      expect(dateToMatchingInterval(new Date('2024-06-14T16:00:00.000Z'))).toEqual('today');
      expect(dateToMatchingInterval(new Date('2024-06-14T03:00:00.000Z'))).toEqual('yesterday');
      expect(dateToMatchingInterval(new Date('2024-06-15T01:00:00.000Z'))).toEqual('today');
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
});
