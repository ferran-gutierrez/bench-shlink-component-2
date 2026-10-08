---
name: Visits date intervals local timezone
description: Fix visits and related date-interval filters so Today, Yesterday, and Last N days use the browser local calendar day boundaries instead of UTC, including fallback interval selection from the latest visit.
targets:
  - src/utils/dates/helpers/dateIntervals.ts
  - test/utils/dates/helpers/dateIntervals.test.ts
  - test/utils/dates/helpers/dateIntervals.localTimezone.test.ts
---

- **REQ-1** When the browser timezone is `America/Los_Angeles` and the current time is `2024-06-14T17:00:00.000Z` (10:00 on June 14 locally), `intervalToDateRange('today')` returns `startDate` `2024-06-14T07:00:00.000Z` and `endDate` `2024-06-15T06:59:59.999Z`, so evening visits on June 13 local time are excluded and visits after 17:00 local on June 14 are included.
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-2** When the browser timezone is `America/Los_Angeles` and the current time is `2024-06-14T17:00:00.000Z`, `intervalToDateRange('yesterday')` covers the full previous local calendar day from `2024-06-13T07:00:00.000Z` through `2024-06-14T06:59:59.999Z`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-3** When the browser timezone is `America/Los_Angeles` and the current time is `2024-06-14T17:00:00.000Z`, `intervalToDateRange('last7Days')` starts at local midnight seven calendar days before the current local day (`2024-06-07T07:00:00.000Z`) and ends at the end of the current local day (`2024-06-15T06:59:59.999Z`); the same local-midnight-to-end-of-today rule applies to `last30Days`, `last90Days`, `last180Days`, and `last365Days` with the corresponding day counts (30, 90, 180, 365).
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-4** When the browser timezone is `America/Los_Angeles`, `intervalToDateRange('today')` on `2024-03-10T10:00:00.000Z` (US spring-forward day) and on `2024-11-03T10:00:00.000Z` (US fall-back day) still uses that timezone's local calendar day start and end for each instant.
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-5** When the browser timezone is `Pacific/Auckland` and the current time is `2024-06-14T14:00:00.000Z` (02:00 on June 15 locally), `intervalToDateRange('today')` returns the local day from `2024-06-14T12:00:00.000Z` through `2024-06-15T11:59:59.999Z`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-6** When the browser timezone is `UTC` and the current time is `2024-06-14T12:00:00.000Z`, `intervalToDateRange` for `today`, `yesterday`, and `last7Days` produces the same `startDate` and `endDate` values as before this change (UTC calendar-day boundaries at `2024-06-14T00:00:00.000Z` / `2024-06-14T23:59:59.999Z` for `today`, the previous UTC day for `yesterday`, and seven UTC days ago through end of today UTC for `last7Days`).
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-7** When the browser timezone is `America/Los_Angeles` and the current time is `2024-06-14T17:00:00.000Z`, `dateToMatchingInterval('2024-06-14T20:00:00.000Z')` returns `today`, `dateToMatchingInterval('2024-06-13T20:00:00.000Z')` returns `yesterday`, and `dateToMatchingInterval('2024-06-06T20:00:00.000Z')` returns `last7Days`, so empty visit loads pick the interval aligned with the latest visit's local calendar day.
  `[@test] ../test/utils/dates/helpers/dateIntervals.localTimezone.test.ts`

- **REQ-8** Existing unit expectations in `dateIntervals.test.ts` for `intervalToDateRange`, `dateToMatchingInterval`, and `toDateRange` continue to pass under the default CI browser timezone (UTC) without changing snapshot or table-driven expected calendar dates.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

## Assumptions

- Day boundaries for all preset intervals (`today`, `yesterday`, `last7Days`, `last30Days`, `last90Days`, `last180Days`, `last365Days`) are computed with `date-fns` `startOfDay` and `endOfDay` on the runtime `Date`, matching the browser's local time zone (same as `Intl` / `Date` local getters), replacing the previous UTC `getUTC*` midnight logic in `dateIntervals.ts`.
- Regression tests for non-UTC zones use Vitest browser `cdp()` to call Chrome DevTools `Emulation.setTimezoneOverride` before each case and reset it afterward; no changes to `vite.config.ts` or `test/__helpers__/setup.ts` are required.
- `dateIntervals.localTimezone.test.ts` uses `vi.useFakeTimers` / `vi.setSystemTime` for fixed instants; timezone override is applied via CDP, not `process.env.TZ`.
- Custom date ranges chosen in the UI and `calcPrevDateRange` behavior are out of scope except where they already rely on the same interval helpers; this task only corrects preset interval boundaries and `dateToMatchingInterval`.
- No new npm dependencies are added; `date-fns` already in the project is sufficient for the implementation.
