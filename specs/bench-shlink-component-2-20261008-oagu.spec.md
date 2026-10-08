---
name: Visits date filters local timezone
description: Preset visit date intervals (Today, Yesterday, Last N days) and fallback interval selection use the user's local calendar day boundaries instead of UTC.
targets:
  - ../src/utils/dates/helpers/dateIntervals.ts
  - ../test/utils/dates/helpers/dateIntervals.test.ts
---

# Visits date filters local timezone

## Requirements

- **REQ-1** Preset interval `today` resolves to a date range from the start of the current local calendar day through the end of the current local calendar day (inclusive), where “local” is the browser runtime timezone.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-2** Preset interval `yesterday` resolves to the full previous local calendar day (local midnight through local end of day).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-3** Preset intervals `last7Days`, `last30Days`, `last90Days`, `last180Days`, and `last365Days` each start at local midnight on the calendar day that is N days before today and end at the end of the current local calendar day.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-4** `dateToMatchingInterval` classifies a visit timestamp into the same preset intervals (today, yesterday, last N days, or all) using those local calendar day boundaries, so the interval chosen from the latest visit date matches what the user would get by picking that preset manually.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-5** Day-boundary helpers used by preset intervals and `dateToMatchingInterval` rely on local calendar days via `date-fns` `startOfDay` / `endOfDay` (or equivalent local-date logic), not UTC date components (`getUTC*` / `Date.UTC` midnight truncation).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-6** When the runtime local timezone is UTC, preset intervals and `dateToMatchingInterval` produce the same ranges and classifications as before the fix (no behaviour change for UTC users).
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

- **REQ-7** Regression coverage includes frozen-clock scenarios for `America/Los_Angeles` and `Pacific/Auckland` (including at least one US daylight-saving transition date), asserting documented local-day UTC instants for Today / Yesterday / Last 7 days and proving the pre-fix UTC-calendar-day algorithm would yield different bounds.
  `[@test] ../test/utils/dates/helpers/dateIntervals.test.ts`

## Assumptions

- CI and unit tests run in a UTC local timezone (GitHub Actions Ubuntu); REQ-6 is the primary guard in CI, while REQ-7 uses fixed expected UTC timestamps and a documented legacy UTC-day comparison so non-UTC behaviour is verified without changing test runner configuration or protected config files.
- `date-fns` `startOfDay` and `endOfDay` correctly handle daylight-saving transitions for local calendar days; no new npm dependencies are required.
- Visit API query parameters continue to be built with existing `formatIsoDate` on the computed `Date` values; only how preset ranges are calculated changes.
- `DateRangeSelector` and visit loading paths already consume `intervalToDateRange` / `dateToMatchingInterval`, so fixing `dateIntervals.ts` fixes short URL visit stats, visit comparison, and related screens without separate interval logic.
