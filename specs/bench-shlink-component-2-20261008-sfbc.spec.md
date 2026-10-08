---
name: Visits date filters use local time zone day boundaries
description: Fix Today, Yesterday, and Last N days visit filters so day boundaries follow the user's local time zone, including DST, with regression tests that pass in UTC CI.
targets:
  - src/utils/dates/helpers/dateIntervals.ts
  - test/utils/dates/helpers/dateIntervals.test.ts
---

- **REQ-1** When the user's local time zone is not UTC, `intervalToDateRange('today')` returns a range whose `startDate` is the instant of local midnight at the start of the current local calendar day and whose `endDate` is the last millisecond of that same local calendar day. For example, with system time fixed at `2024-06-14T17:00:00.000Z` and local offset UTC−7 (America/Los_Angeles on that date), `startDate` must equal `2024-06-14T07:00:00.000Z` and `endDate` must equal `2024-06-15T06:59:59.999Z`, not the UTC-day window that would begin at `2024-06-14T00:00:00.000Z`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-2** When the user's local time zone is not UTC, `intervalToDateRange('yesterday')` returns the full previous local calendar day from its local midnight through its local end of day. For example, with the same fixed instant and offset as REQ-1, `startDate` must equal `2024-06-13T07:00:00.000Z` and `endDate` must equal `2024-06-14T06:59:59.999Z`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-3** When the user's local time zone is not UTC, each Last N days interval (`last7Days`, `last30Days`, `last90Days`, `last180Days`, `last365Days`) spans from local midnight on the local calendar day that falls N days before today through the end of the current local calendar day. For example, with system time fixed at `2024-06-14T17:00:00.000Z` and local offset UTC−7, `intervalToDateRange('last7Days').startDate` must equal `2024-06-07T07:00:00.000Z` and `endDate` must match REQ-1's end for today.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-4** When the user's local time zone is UTC (local offset zero), `intervalToDateRange` for `today`, `yesterday`, and every Last N days interval produces the same `startDate` and `endDate` values as `startOfDay` and `endOfDay` from date-fns applied to the reference "now" and the corresponding subDays anchors, so UTC users see no change from correct UTC calendar-day filtering.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-5** On a local calendar day when daylight saving time starts or ends, `intervalToDateRange('today')` still covers the entire local calendar day (local midnight through local end of day), even when that day has 23 or 25 hours. For example, with system time fixed at `2024-03-10T12:00:00.000Z`, local offset UTC−8 (America/Los_Angeles before the spring-forward transition on that date), `startDate` must equal `2024-03-10T08:00:00.000Z` and `endDate` must equal `2024-03-11T07:59:59.999Z`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-6** `dateToMatchingInterval` classifies visit timestamps against the same local calendar-day boundaries as REQ-1 through REQ-3, so an empty initial load that falls back to an interval from the latest visit picks the interval that contains that visit in the user's local time zone. For example, with system time at `2024-06-14T17:00:00.000Z` and local offset UTC−7, a visit at `2024-06-14T16:00:00.000Z` (09:00 local) must map to `today`, while a visit at `2024-06-14T06:00:00.000Z` (23:00 local on June 13) must map to `yesterday`, not `today`.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

## Assumptions

- The "user's local time zone" is the JavaScript environment's default local time zone (Date local getters and date-fns `startOfDay` / `endOfDay`), not a separate Shlink setting.
- Day-boundary logic lives in `src/utils/dates/helpers/dateIntervals.ts`; visit reducers and UI continue to consume `intervalToDateRange` and `dateToMatchingInterval` without duplicating boundary rules.
- Regression tests run in UTC CI by fixing system time with Vitest fake timers and stubbing `Date.prototype.getTimezoneOffset` to emulate non-UTC zones, because the Vitest browser runner uses Chromium in UTC.
- DST behaviour for local calendar days relies on date-fns local `startOfDay` and `endOfDay` after replacing the current UTC-midnight helpers; REQ-5 locks one spring-forward example rather than every regional DST rule.
- Auckland and other zones are covered by the same local-boundary implementation as REQ-1; no separate Pacific/Auckland test file is required beyond the Los Angeles and UTC examples.
