import { endOfDay, startOfDay } from 'date-fns';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cdp } from 'vitest/browser';
import type { DateInterval } from '../../../../src/utils/dates/helpers/dateIntervals';
import { dateToMatchingInterval, intervalToDateRange } from '../../../../src/utils/dates/helpers/dateIntervals';

const AMERICA_LOS_ANGELES = 'America/Los_Angeles';
const PACIFIC_AUCKLAND = 'Pacific/Auckland';
const UTC_TIMEZONE = 'UTC';

type CdpSessionWithSend = {
  send: (method: string, params?: Record<string, string>) => Promise<void>;
};

const browserCdp = () => cdp() as unknown as CdpSessionWithSend;

const overrideTimezone = async (timezoneId: string) => {
  await browserCdp().send('Emulation.setTimezoneOverride', { timezoneId });
};

const clearTimezoneOverride = async () => {
  await browserCdp().send('Emulation.setTimezoneOverride', { timezoneId: '' });
};

const expectIntervalRange = (interval: DateInterval, startIso: string, endIso: string) => {
  const { startDate, endDate } = intervalToDateRange(interval);
  expect(startDate?.toISOString()).toEqual(startIso);
  expect(endDate?.toISOString()).toEqual(endIso);
};

describe('dateIntervals local timezone', () => {
  afterEach(async () => {
    vi.useRealTimers();
    await clearTimezoneOverride();
  });

  describe('America/Los_Angeles at 2024-06-14T17:00:00.000Z', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-14T17:00:00.000Z'));
      await overrideTimezone(AMERICA_LOS_ANGELES);
    });

    it('REQ-1 intervalToDateRange(today) uses the current local calendar day', () => {
      expectIntervalRange('today', '2024-06-14T07:00:00.000Z', '2024-06-15T06:59:59.999Z');
    });

    it('REQ-2 intervalToDateRange(yesterday) uses the previous local calendar day', () => {
      expectIntervalRange('yesterday', '2024-06-13T07:00:00.000Z', '2024-06-14T06:59:59.999Z');
    });

    it('REQ-3 intervalToDateRange(lastNDays) spans local midnight N days ago through end of today', () => {
      expectIntervalRange('last7Days', '2024-06-07T07:00:00.000Z', '2024-06-15T06:59:59.999Z');
      expectIntervalRange('last30Days', '2024-05-15T07:00:00.000Z', '2024-06-15T06:59:59.999Z');
      expectIntervalRange('last90Days', '2024-03-16T07:00:00.000Z', '2024-06-15T06:59:59.999Z');
      expectIntervalRange('last180Days', '2023-12-17T08:00:00.000Z', '2024-06-15T06:59:59.999Z');
      expectIntervalRange('last365Days', '2023-06-15T07:00:00.000Z', '2024-06-15T06:59:59.999Z');
    });

    it('REQ-7 dateToMatchingInterval maps today, yesterday, and last7Days visits', () => {
      expect(dateToMatchingInterval('2024-06-14T20:00:00.000Z')).toEqual('today');
      expect(dateToMatchingInterval('2024-06-13T20:00:00.000Z')).toEqual('yesterday');
      expect(dateToMatchingInterval('2024-06-07T20:00:00.000Z')).toEqual('last7Days');
    });

    it('REQ-7 dateToMatchingInterval maps the first local day in last7Days and the prior local day', () => {
      expect(dateToMatchingInterval('2024-06-07T07:00:00.000Z')).toEqual('last7Days');
      expect(dateToMatchingInterval('2024-06-06T20:00:00.000Z')).toEqual('last30Days');
    });
  });

  describe('America/Los_Angeles DST transition days', () => {
    beforeEach(async () => {
      await overrideTimezone(AMERICA_LOS_ANGELES);
    });

    it('REQ-4 intervalToDateRange(today) on US spring-forward day uses local calendar boundaries', () => {
      const instant = new Date('2024-03-10T10:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(instant);

      expectIntervalRange('today', startOfDay(instant).toISOString(), endOfDay(instant).toISOString());
    });

    it('REQ-4 intervalToDateRange(today) on US fall-back day uses local calendar boundaries', () => {
      const instant = new Date('2024-11-03T10:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(instant);

      expectIntervalRange('today', startOfDay(instant).toISOString(), endOfDay(instant).toISOString());
    });
  });

  describe('Pacific/Auckland at 2024-06-14T14:00:00.000Z', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-14T14:00:00.000Z'));
      await overrideTimezone(PACIFIC_AUCKLAND);
    });

    it('REQ-5 intervalToDateRange(today) uses the current local calendar day', () => {
      expectIntervalRange('today', '2024-06-14T12:00:00.000Z', '2024-06-15T11:59:59.999Z');
    });
  });

  describe('UTC at 2024-06-14T12:00:00.000Z', () => {
    beforeEach(async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-06-14T12:00:00.000Z'));
      await overrideTimezone(UTC_TIMEZONE);
    });

    it('REQ-6 intervalToDateRange preserves UTC calendar-day boundaries', () => {
      expectIntervalRange('today', '2024-06-14T00:00:00.000Z', '2024-06-14T23:59:59.999Z');
      expectIntervalRange('yesterday', '2024-06-13T00:00:00.000Z', '2024-06-13T23:59:59.999Z');
      expectIntervalRange('last7Days', '2024-06-07T00:00:00.000Z', '2024-06-14T23:59:59.999Z');
    });
  });
});
